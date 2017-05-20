import 'bootstrap/dist/css/bootstrap.min.css'
import gql from 'graphql-tag'
import React from 'react'
import { compose, graphql } from 'react-apollo'

const CreateUserQuery = gql`
mutation CreateUser($user: CreateUserInput!) {
  createUser(input: $user) {
    user {
      id
      username
    }
    token
  }
}
`

const LoginQuery = gql`
mutation Login($cred: LoginUserInput!) {
  loginUser(input: $cred) {
    user {
      id
      username
    }
    token
  }
}
`

class Login extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      cred: {
        password: '',
        username: ''
      }
    }
  }

  onPasswordChanged (event) {
    this.setState({
      cred: {
        password: event.target.value,
        username: this.state.cred.username
      }
    })
  }

  onUsernameChanged (event) {
    this.setState({
      cred: {
        password: this.state.cred.password,
        username: event.target.value
      }
    })
  }

  render () {
    return (
      <div className='container'>
        <div style={{ padding: '15px' }}>
          <h1>Login</h1>
          <input
            className='form-control'
            placeholder='username'
            type='text'
          />
          <input
            className='form-control'
            placeholder='password'
            type='text'
          />
          <button type='submit' className='btn btn-primary'>Login</button>
          <button type='submit' className='btn btn-primary'>Register</button>
        </div>
      </div>
    )
  }

}

export default compose(
  graphql(CreateUserQuery, {
    props: ({ mutate }) => ({
      createUser: user => mutate({variables: {user}})
    })
  }),
  graphql(LoginQuery, {
    props: ({ mutate }) => ({
      login: cred => mutate({variables: {cred}})
    })
  })
)(Login)
