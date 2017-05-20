import 'bootstrap/dist/css/bootstrap.min.css'
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
