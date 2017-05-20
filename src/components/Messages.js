import 'bootstrap/dist/css/bootstrap.min.css'
import gql from 'graphql-tag'
import React from 'react'
import { graphql, compose } from 'react-apollo'

import styles from './index.scss'

const ChannelMessagesQuery = gql`
query GetPublicChannels($channelId: ID!, $messageOrder: [MessageOrderByArgs]) {
  getChannel(id: $channelId) {
    id
    name
    messages(last: 50, orderBy: $messageOrder) {
      edges {
        node {
          id
          content
          createdAt
          author {
            id
            username
            nickname
            picture
          }
        }
      }
    }
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
      username
      nickname
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
        // If we change channels, subscribe to the new channel
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
        <div className={styles.messagePage}>
          <div className={styles.messageHeaderWrapper}>
            <h3>{this.props.data.getChannel.name}</h3>
          </div>
          <div className={styles.messageListWrapper}>
            <ul>
              {
                this.props.data.getChannel.messages.edges.map((edge, i) => (
                  <li key={i}>
                    <div className={styles.messageBlock}>
                      {
                        edge.node.author && edge.node.author.picture
                          ? (
                            <img
                              src={edge.node.author.picture}
                              style={{
                                borderRadius: '15px',
                                float: 'left',
                                height: '30px',
                                marginLeft: '-36px',
                                marginTop: '10px',
                                width: '30px'
                              }}
                            />
                          )
                          : null
                      }
                      <div className={styles.messageContent}>
                        <div className={styles.messageHeader}>
                          {
                            <h6>
                              {
                                edge.node.author
                                  ? (
                                    edge.node.author.nickname ||
                                    edge.node.author.username
                                  )
                                  : 'Anonymous'
                              }
                            </h6>
                          }
                          {
                            <span className='text-muted'>
                              {
                                new Date(edge.node.createdAt)
                                  .toISOString()
                                  .substr(11, 5)
                              }
                            </span>
                          }
                        </div>
                        <div>
                          {edge.node.content}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
          <div className={styles.messageInputWrapper}>
            <form onSubmit={this.submitMessage}>
              <div className='input-group'>
                <input value={this.state.newMessage} onChange={this.onNewMessageChange} type='textarea' placeholder={`Message ${this.props.data.getChannel.name}`} className='form-control' />
                <span className='input-group-btn'>
                  <button className='btn btn-info' type='submit' onClick={this.submitMessage}>Send!</button>
                </span>
              </div>
            </form>
          </div>
        </div>
      )
      : <h5>Loading...</h5>
  }

  subscribeToNewMessages () {
    this.subscription = this.props.data.subscribeToMore({
      document: gql`
        subscription newMessages($subscriptionFilter:MessageSubscriptionFilter) {
          subscribeToMessage(mutations:[createMessage], filter: $subscriptionFilter) {
            edge {
              node {
                id
                content
                createdAt
                author {
                  id
                  username
                  nickname
                  picture
                }
              }
            }
          }
        }
      `,
      variables: {
        subscriptionFilter: {
          channelId: {
            eq: this.props.params ? this.props.params.channelId : null
          }
        }
      },
      updateQuery: (prev, { subscriptionData }) => {
        const newEdges = [
          ...prev.getChannel.messages.edges,
          subscriptionData.data.subscribeToMessage.edge
        ]
        return {
          getChannel: {
            messages: {
              edges: newEdges
            }
          }
        }
      }
    })
  }

  submitMessage (event) {
    if (event) {
      event.preventDefault()
    }
    const that = this
    this.props.createMessage({
      content: this.state.newMessage,
      channelId: this.props.data.getChannel.id,
      authorId: this.props.loggedInUser ? this.props.loggedInUser.id : undefined
    }).then(() => {
      that.setState({
        newMessage: ''
      })
    })
  }

}

const MessagesWithData = compose(
  graphql(ChannelMessagesQuery, {
    options: (props) => {
      const channelId = props.params ? props.params.channelId : null
      return {
        variables: {
          channelId,
          messageOrder: [
            {
              field: 'createdAt',
              direction: 'ASC'
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
