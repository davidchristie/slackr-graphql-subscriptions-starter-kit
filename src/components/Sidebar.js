import React from 'react'

import Channels from './Channels'

export default class Sidebar extends React.Component {

  render () {
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
        <Channels />
      </div>
    )
  }

}
