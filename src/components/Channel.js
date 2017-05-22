import gql from 'graphql-tag'
import React from 'react'
import { compose, graphql } from 'react-apollo'

import MessageList from './MessageList'

const CREATE_MESSAGE_MUTATION = gql`
mutation CreateMessage($message: CreateMessageInput!) {
  createMessage(input: $message) {
    changedMessage {
      id
      content
      author {
        id
        nickname
        picture
        username
      }
    }
  }
}
`

const GET_PUBLIC_CHANNELS_QUERY = gql`
query GetPublicChannels($channelId: ID!, $messageOrder: [MessageOrderByArgs]) {
  getChannel(id: $channelId) {
    id
    messages(last: 50, orderBy: $messageOrder) {
      edges {
        node {
          author {
            id
            nickname
            picture
            username
          }
          content
          createdAt
          id
        }
      }
    }
    name
  }
}
`

const LOGGED_IN_USER_QUERY = gql`
query LoggedInUser {
  viewer {
    user {
      id
      nickname
      username
    }
  }
}
`

const NEW_MESSAGES_SUBSCRIPTION = gql`
  subscription NewMessages($subscriptionFilter:MessageSubscriptionFilter) {
    subscribeToMessage(mutations:[createMessage], filter: $subscriptionFilter) {
      edge {
        node {
          author {
            id
            nickname
            picture
            username
          }
          content
          createdAt
          id
        }
      }
    }
  }
`

class Channel extends React.Component {

  constructor (props) {
    super(props)
    this.onNewMessageChange = this.onNewMessageChange.bind(this)
    this.submitMessage = this.submitMessage.bind(this)
    this.state = {
      newMessage: ''
    }
  }

  componentWillReceiveProps (newProps) {
    if (
      !newProps.data.loading &&
      newProps.data.getChannel
    ) {
      if (
        !this.props.data.getChannel ||
        newProps.data.getChannel.id !== this.props.data.getChannel.id
      ) {
        this.subscribeToNewMessages()
      }
    }
  }

  componentWillUnmount () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  onNewMessageChange (event) {
    this.setState({
      newMessage: event.target.value
    })
  }

  render () {
    return this.props.data.getChannel
      ? (
        <div
          style={{
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0
          }}
        >
          <div
            style={{
              borderBottom: '1px solid #ddd',
              left: 0,
              padding: '15px',
              position: 'absolute',
              right: 0,
              top: 0
            }}
          >
            <h3>{this.props.data.getChannel.name}</h3>
          </div>
          <MessageList
            messages={this.props.data.getChannel.messages.edges.map(
              edge => edge.node
            )}
          />
          <div
            style={{
              bottom: '15px',
              left: '15px',
              position: 'absolute',
              right: '15px'
            }}
          >
            <form onSubmit={this.submitMessage}>
              <div className='input-group'>
                <input value={this.state.newMessage} onChange={this.onNewMessageChange} type='textarea' placeholder={`Message ${this.props.data.getChannel.name}`} className='form-control' />
                <span className='input-group-btn'>
                  <button
                    className='btn btn-info'
                    onClick={this.submitMessage}
                    type='submit'
                  >
                      Send!
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>
      )
      : <h5>Loading...</h5>
  }

  submitMessage (event) {
    if (event) {
      event.preventDefault()
    }
    const that = this
    this.props.createMessage({
      authorId: this.props.loggedInUser
        ? this.props.loggedInUser.id
        : undefined,
      channelId: this.props.data.getChannel.id,
      content: this.state.newMessage
    }).then(() => {
      that.setState({
        newMessage: ''
      })
    })
  }

  subscribeToNewMessages () {
    this.subscription = this.props.data.subscribeToMore({
      document: NEW_MESSAGES_SUBSCRIPTION,
      variables: {
        subscriptionFilter: {
          channelId: {
            eq: this.props.match.params
              ? this.props.match.params.channelId
              : null
          }
        }
      },
      updateQuery: (previous, { subscriptionData }) => {
        const newEdges = [
          ...previous.getChannel.messages.edges,
          subscriptionData.data.subscribeToMessage.edge
        ]
        return {
          ...previous,
          getChannel: {
            ...previous.getChannel,
            messages: {
              ...previous.getChannel.messages,
              edges: newEdges
            }
          }
        }
      }
    })
  }

}

const withData = compose(
  graphql(GET_PUBLIC_CHANNELS_QUERY, {
    options: props => {
      const channelId = props.match.params
        ? props.match.params.channelId
        : null
      return {
        variables: {
          channelId,
          messageOrder: [
            {
              direction: 'ASC',
              field: 'createdAt'
            }
          ]
        }
      }
    }
  }),
  graphql(LOGGED_IN_USER_QUERY, {
    props: ({ data }) => ({
      loggedInUser: data.viewer ? data.viewer.user : null
    })
  }),
  graphql(CREATE_MESSAGE_MUTATION, {
    props: ({ mutate }) => ({
      createMessage: message => mutate({variables: {message}})
    })
  })
)

export default withData(Channel)
