import gql from 'graphql-tag'
import React from 'react'
import { compose, graphql } from 'react-apollo'
import { Link } from 'react-router-dom'

import configuration from '../configuration'
import Authentication from '../utilities/Authentication'
import ChannelList from './ChannelList'

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

class Sidebar extends React.Component {

  constructor (props) {
    super(props)
    this.authentication = new Authentication(configuration.auth0ClientId, configuration.auth0Domain)
    this.logout = this.logout.bind(this)
    this.onAuthenticated = this.onAuthenticated.bind(this)
    this.startLogin = this.startLogin.bind(this)
    this.authentication.on('authenticated', this.onAuthenticated)
    this.authentication.on('error', console.log)
  }

  logout () {
    this.authentication.logout()
    this.setState({})
  }

  onAuthenticated (auth0Profile, tokenPayload) {
    const that = this
    this.props.loginUser({
      idToken: tokenPayload.idToken
    })
      .then(response => {
        const scapholdUserId = response.data.loginUserWithAuth0.user.id
        const profilePicture = auth0Profile.picture
        const nickname = auth0Profile.nickname
        return that.props.updateUser({
          id: scapholdUserId,
          nickname: nickname,
          picture: profilePicture
        })
      }).catch(error => {
        console.log(`Error updating user: ${error.message}`)
      })
  }

  render () {
    const profile = this.authentication.getProfile()
    return (
      <div
        style={{
          backgroundColor: 'rgb(60, 42, 59)',
          bottom: 0,
          color: 'white',
          left: 0,
          padding: '15px',
          position: 'fixed',
          top: 0,
          width: '300px'
        }}
      >
        <ChannelList />
        <Link
          style={{
            color: 'white'
          }}
          to='/createChannel'
        >
          Create channel
        </Link>
        {
          !this.authentication.loggedIn()
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
    this.authentication.login()
  }

}

const withData = compose(
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

export default withData(Sidebar)
