import 'bootstrap/dist/css/bootstrap.min.css'
import gql from 'graphql-tag'
import React from 'react'
import { compose, graphql } from 'react-apollo'
import { Link } from 'react-router-dom'

import config from '../config'
import AuthService from '../utilities/auth'

const LoginQuery = gql`
mutation Login($credential: LoginUserWithAuth0Input!) {
  loginUserWithAuth0(input: $credential) {
    user {
      id
      username
    }
  }
}
`

const PublicChannelsQuery = gql`
query GetPublicChannels($wherePublic: ChannelWhereArgs, $orderBy: [ChannelOrderByArgs]) {
  viewer {
    allChannels(where: $wherePublic, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          isPublic
        }
      }
    }
  }
}
`

const UpdateUserQuery = gql`
mutation UpdateUser($user: UpdateUserInput!) {
  updateUser(input: $user) {
    changedUser {
      id
      username
      picture
    }
  }
}
`

class Channels extends React.Component {

  constructor (props) {
    super(props)
    this.onAuthenticated = this.onAuthenticated.bind(this)
    this.startLogin = this.startLogin.bind(this)
    this.logout = this.logout.bind(this)
    this.auth = new AuthService(config.auth0ClientId, config.auth0Domain)
    this.auth.on('authenticated', this.onAuthenticated)
    this.auth.on('error', console.log)
  }

  componentDidMount () {
    this.subscription = this.props.data.subscribeToMore({
      document: gql`
        subscription newChannels($subscriptionFilter:ChannelSubscriptionFilter) {
          subscribeToChannel(mutations:[createChannel], filter: $subscriptionFilter) {
            edge {
              node {
                id
                name
                createdAt
              }
            }
          }
        }
      `,
      variables: {
        subscriptionFilter: {
          isPublic: {
            eq: true
          }
        }
      },
      updateQuery: (prev, { subscriptionData }) => {
        return {
          viewer: {
            allChannels: {
              edges: [
                ...prev.viewer.allChannels.edges,
                subscriptionData.data.subscribeToChannel.edge
              ]
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

const ChannelsWithData = compose(
  graphql(PublicChannelsQuery, {
    options: (props) => {
      return {
        variables: {
          wherePublic: {
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
  graphql(LoginQuery, {
    props: ({ mutate }) => ({
      loginUser: (credential) => mutate({variables: {credential}})
    })
  }),
  graphql(UpdateUserQuery, {
    props: ({ mutate }) => ({
      updateUser: (user) => mutate({variables: {user}})
    })
  })
)(Channels)

export default ChannelsWithData
