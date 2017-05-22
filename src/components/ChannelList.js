import 'bootstrap/dist/css/bootstrap.min.css'
import gql from 'graphql-tag'
import React from 'react'
import { compose, graphql } from 'react-apollo'
import { Link } from 'react-router-dom'

import config from '../config'
import AuthService from '../utilities/auth'

const GET_PUBLIC_CHANNELS_QUERY = gql`
query GetPublicChannels($where: ChannelWhereArgs, $orderBy: [ChannelOrderByArgs]) {
  viewer {
    allChannels(where: $where, orderBy: $orderBy) {
      edges {
        node {
          id
          isPublic
          name
        }
      }
    }
  }
}
`

const LOGIN_MUTATION = gql`
mutation Login($credential: LoginUserWithAuth0Input!) {
  loginUserWithAuth0(input: $credential) {
    user {
      id
      username
    }
  }
}
`

const NEW_CHANNELS_SUBSCRIPTION = gql`
  subscription NewChannels($subscriptionFilter:ChannelSubscriptionFilter) {
    subscribeToChannel(mutations:[createChannel], filter: $subscriptionFilter) {
      edge {
        node {
          createdAt
          id
          isPublic
          name
        }
      }
    }
  }
`

const UPDATE_USER_MUTATION = gql`
mutation UpdateUser($user: UpdateUserInput!) {
  updateUser(input: $user) {
    changedUser {
      id
      picture
      username
    }
  }
}
`

class ChannelList extends React.Component {

  constructor (props) {
    super(props)
    this.auth = new AuthService(config.auth0ClientId, config.auth0Domain)
    this.logout = this.logout.bind(this)
    this.onAuthenticated = this.onAuthenticated.bind(this)
    this.startLogin = this.startLogin.bind(this)
    this.auth.on('authenticated', this.onAuthenticated)
    this.auth.on('error', console.log)
  }

  componentDidMount () {
    this.subscription = this.props.data.subscribeToMore({
      document: NEW_CHANNELS_SUBSCRIPTION,
      variables: {
        subscriptionFilter: {
          isPublic: {
            eq: true
          }
        }
      },
      updateQuery: (previous, { subscriptionData }) => {
        const newEdges = [
          ...previous.viewer.allChannels.edges,
          subscriptionData.data.subscribeToChannel.edge
        ]
        newEdges.sort((a, b) => {
          if (a.node.name < b.node.name) return -1
          else if (a.node.name > b.node.name) return 1
          else return 0
        })
        return {
          ...previous,
          viewer: {
            ...previous.viewer,
            allChannels: {
              ...previous.viewer.allChannels,
              edges: newEdges
            }
          }
        }
      }
    })
  }

  componentWillUnmount () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  logout () {
    this.auth.logout()
    this.setState({})
  }

  onAuthenticated (auth0Profile, tokenPayload) {
    const that = this
    this.props.loginUser({
      idToken: tokenPayload.idToken
    }).then(res => {
      const scapholdUserId = res.data.loginUserWithAuth0.user.id
      const profilePicture = auth0Profile.picture
      const nickname = auth0Profile.nickname
      return that.props.updateUser({
        id: scapholdUserId,
        picture: profilePicture,
        nickname: nickname
      })
    }).catch(err => {
      console.log(`Error updating user: ${err.message}`)
    })
  }

  render () {
    const profile = this.auth.getProfile()
    return (
      <div>
        <h3>
          Channels
          <a href='https://scaphold.io'>
            <img
              alt=''
              src='https://scaphold.io/5d9897e87a7c597b0589f95cde19ad9d.png'
              style={{
                height: '30px',
                float: 'right',
                width: '30px'
              }}
              target='_blank'
            />
          </a>
        </h3>
        {
          this.props.data.viewer
            ? (
              <ul
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  height: '60vh',
                  listStyle: 'none',
                  overflowY: 'scroll'
                }}
              >
                {
                  this.props.data.viewer.allChannels.edges.map(edge => (
                    <li key={edge.node.id}>
                      <Link
                        style={{
                          color: 'white'
                        }}
                        to={`/channels/${edge.node.id}`}
                      >
                        {edge.node.name}
                      </Link>
                    </li>
                  ))
                }
              </ul>
            )
            : null
        }
        <Link
          style={{
            color: 'white'
          }}
          to='/createChannel'
        >
          Create channel
        </Link>
        {
          !this.auth.loggedIn()
            ? (
              <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', textAlign: 'center'}}>
                <button
                  className='btn btn-primary'
                  onClick={this.startLogin}
                  type='button'
                >
                  Login
                </button>
              </div>
            )
            : (
              <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', textAlign: 'center'}}>
                <div style={{ marginBottom: '5px' }}>
                  {profile ? profile.nickname : ''}
                </div>
                {
                  profile
                    ? (
                      <div>
                        <img
                          alt=''
                          src={profile.picture}
                          style={{
                            borderRadius: '20px',
                            height: '40px',
                            marginBottom: '5px',
                            width: '40px'
                          }}
                        />
                      </div>
                    )
                    : null
                }
                <button
                  className='btn btn-secondary'
                  onClick={this.logout}
                  type='button'
                >
                  Logout
                </button>
              </div>
            )
        }
      </div>
    )
  }

  startLogin () {
    this.auth.login()
  }

}

const withData = compose(
  graphql(GET_PUBLIC_CHANNELS_QUERY, {
    options: (props) => {
      return {
        variables: {
          where: {
            isPublic: {
              eq: true
            }
          },
          orderBy: [
            {
              field: 'name',
              direction: 'ASC'
            }
          ]
        }
      }
    }
  }),
  graphql(LOGIN_MUTATION, {
    props: ({ mutate }) => ({
      loginUser: (credential) => mutate({variables: {credential}})
    })
  }),
  graphql(UPDATE_USER_MUTATION, {
    props: ({ mutate }) => ({
      updateUser: (user) => mutate({variables: {user}})
    })
  })
)

export default withData(ChannelList)
