import PropTypes from 'prop-types'
import React from 'react'

class Message extends React.Component {

  render () {
    return (
      <li>
        <div
          style={{
            padding: '5px'
          }}
        >
          {
            this.props.author && this.props.author.picture
              ? (
                <img
                  alt=''
                  src={this.props.author.picture}
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
          <div
            style={{
              display: 'inline'
            }}
          >
            <div>
              {
                <h6
                  style={{
                    display: 'inline',
                    marginRight: '10px'
                  }}
                >
                  {
                    this.props.author
                      ? (
                        this.props.author.nickname ||
                        this.props.author.username
                      )
                      : 'Anonymous'
                  }
                </h6>
              }
              {
                <span className='text-muted'>
                  {
                    new Date(this.props.createdAt)
                      .toISOString()
                      .substr(11, 5)
                  }
                </span>
              }
            </div>
            <div>
              {this.props.content}
            </div>
          </div>
        </div>
      </li>
    )
  }

}

Message.propTypes = {
  author: PropTypes.shape({
    nickname: PropTypes.string,
    username: PropTypes.string
  }),
  content: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired
}

export default Message
