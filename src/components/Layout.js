import React from 'react'

import Sidebar from './Sidebar'

export default class App extends React.Component {

  render () {
    return (
      <div>
        <Sidebar />
        <div
          style={{
            backgroundColor: 'white',
            bottom: 0,
            left: '300px',
            padding: '15px',
            position: 'fixed',
            right: 0,
            top: 0
          }}
        >
          {this.props.children}
        </div>
      </div>
    )
  }

}
