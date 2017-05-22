import gql from 'graphql-tag'
import React from 'react'
import { compose, graphql } from 'react-apollo'

const CREATE_USER_MUTATION = gql`
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    token
    user {
      id
      username
    }
  }
}
`

const LOGIN_MUTATION = gql`
mutation Login($input: LoginUserInput!) {
  loginUser(input: $input) {
    token
    user {
      id
      username
    }
  }
}
`

class Login extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      input: {
        password: '',
        username: ''
      }
    }
  }

  onPasswordChanged (event) {
    this.setState({
      input: {
        password: event.target.value,
        username: this.state.input.username
      }
    })
  }

  onUsernameChanged (event) {
    this.setState({
      input: {
        password: this.state.input.password,
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

const withData = compose(
  graphql(CREATE_USER_MUTATION, {
    props: ({ mutate }) => ({
      createUser: user => mutate({variables: {user}})
    })
  }),
  graphql(LOGIN_MUTATION, {
    props: ({ mutate }) => ({
      login: input => mutate({variables: {input}})
    })
  })
)

export default withData(Login)
