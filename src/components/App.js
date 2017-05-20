import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'

import Channels from './Channels'
import styles from './index.scss'

export default class App extends React.Component {

  render () {
    return (
      <div>
        <div className={styles.sideBar}>
          <Channels />
        </div>
        <div className={styles.mainContent}>
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
