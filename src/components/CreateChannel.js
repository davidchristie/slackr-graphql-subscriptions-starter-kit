import 'bootstrap/dist/css/bootstrap.min.css'
import gql from 'graphql-tag'
import React from 'react'
import { graphql } from 'react-apollo'

const CREATE_CHANNEL_QUERY = gql`
mutation CreateChannel($channel: CreateChannelInput!) {
  createChannel(input: $channel) {
    changedChannel {
      createdAt
      id
      name
    }
  }
}
`

class CreateChannel extends React.Component {

  constructor (props) {
    super(props)
    this.createChannel = this.createChannel.bind(this)
    this.onChannelNameChange = this.onChannelNameChange.bind(this)
    this.onIsPublicChanged = this.onIsPublicChanged.bind(this)
    this.state = {
      channel: {
        isPublic: false,
        name: ''
      }
    }
  }

  createChannel () {
    this.props.createChannel(this.state.channel)
      .then(({ data: { createChannel: { changedChannel } } }) => {
        this.setState({
          channel: {
            isPublic: false,
            name: ''
          }
        })
        this.props.history.push(`/channels/${changedChannel.id}`)
      })
  }

  onChannelNameChange (event) {
    this.setState({
      channel: {
        isPublic: this.state.channel.isPublic,
        name: event.target.value
      }
    })
  }

  onIsPublicChanged (event) {
    this.setState({
      channel: {
        isPublic: event.target.checked,
        name: this.state.channel.name
      }
    })
  }

  render () {
    return (
      <div>
        <h1>New Channel</h1>
        <div className='input-group'>
          <span className='input-group-addon'>
            <span style={{ marginRight: '5px' }}>Public?</span>
            <input onChange={this.onIsPublicChanged} type='checkbox' aria-label='Is Channel Public' />
          </span>
          <input onChange={this.onChannelNameChange} type='text' placeholder='Channel Name' className='form-control' aria-label='Channel Name' />
          <span className='input-group-btn'>
            <button className='btn btn-info' type='button' onClick={this.createChannel}>Create</button>
          </span>
        </div>
      </div>
    )
  }
}

const withData = graphql(CREATE_CHANNEL_QUERY, {
  props: ({ mutate }) => ({
    createChannel: channel => mutate({variables: {channel}})
  })
})

export default withData(CreateChannel)
