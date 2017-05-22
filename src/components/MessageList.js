import PropTypes from 'prop-types'
import React from 'react'

import Message from './Message'

class MessageList extends React.Component {

  render () {
    return (
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
            this.props.messages.map(
              (message, index) => <Message key={index} {...message} />
            )
          }
        </ul>
      </div>
    )
  }

}

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default MessageList
