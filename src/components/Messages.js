import 'bootstrap/dist/css/bootstrap.min.css'
import gql from 'graphql-tag'
import React from 'react'
import { compose, graphql } from 'react-apollo'

import Message from './Message'

const ChannelMessagesQuery = gql`
query GetPublicChannels($channelId: ID!, $messageOrder: [MessageOrderByArgs]) {
  getChannel(id: $channelId) {
    id
    messages(last: 50, orderBy: $messageOrder) {
      edges {
        node {
          author {
            id
            username
            nickname
            picture
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

const CreateMessageQuery = gql`
mutation CreateMessage($message: CreateMessageInput!) {
  createMessage(input: $message) {
    changedMessage {
      id
      content
      author {
        id
        username
        nickname
        picture
      }
    }
  }
}
`

const LoggedInUserQuery = gql`
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

class Messages extends React.Component {

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
          <div
            style={{
              bottom: '50px',
              left: 0,
              overflowY: 'scroll',
              position: 'absolute',
              right: 0,
              top: '69px'
            }}
          >
            <ul
              style={{
                listStyle: 'none'
              }}
            >
              {
                this.props.data.getChannel.messages.edges.map(
                  (edge, index) => <Message key={index} {...edge.node} />
                )
              }
            </ul>
          </div>
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
      document: gql`
        subscription newMessages($subscriptionFilter:MessageSubscriptionFilter) {
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
      `,
      variables: {
        subscriptionFilter: {
          channelId: {
            eq: this.props.match.params
              ? this.props.match.params.channelId
              : null
          }
        }
      },
      updateQuery: (prev, { subscriptionData }) => {
        const newEdges = [
          ...prev.getChannel.messages.edges,
          subscriptionData.data.subscribeToMessage.edge
        ]
        return {
          ...prev,
          getChannel: {
            ...prev.getChannel,
            messages: {
              ...prev.getChannel.messages,
              edges: newEdges
            }
          }
        }
      }
    })
  }

}

const MessagesWithData = compose(
  graphql(ChannelMessagesQuery, {
    options: (props) => {
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
  graphql(LoggedInUserQuery, {
    props: ({ data }) => ({
      loggedInUser: data.viewer ? data.viewer.user : null
    })
  }),
  graphql(CreateMessageQuery, {
    props: ({ mutate }) => ({
      createMessage: message => mutate({variables: {message}})
    })
  })
)(Messages)

export default MessagesWithData
