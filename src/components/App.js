import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'

import Channels from './Channels'

export default class App extends React.Component {

  render () {
    return (
      <div>
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
          <Channels />
        </div>
        <div
          style={{
            backgroundColor: 'white',
            left: '300px',
            bottom: 0,
            padding: '15px',
            position: 'fixed',
            right: 0,
            top: 0
          }}
        >
          {
            this.props.children
              ? React.Children.toArray(this.props.children)
              : <h3>Select a channel</h3>
          }
        </div>
      </div>
    )
  }

}
