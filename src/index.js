import React from 'react'
import { ApolloProvider } from 'react-apollo'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { browserHistory, Route, Router } from 'react-router'

import App from './components/App'
import CreateChannel from './components/CreateChannel'
import Login from './components/Login'
import Messages from './components/Messages'
import config from './config'
import makeApolloClient from './utilities/makeApolloClient'

const client = makeApolloClient(config.scapholdUrl)

const root = (
  <AppContainer>
    <ApolloProvider client={client}>
      <Router history={browserHistory}>
        <Route path='/' component={App}>
          <Route path='login' component={Login} />
          <Route path='createChannel' component={CreateChannel} />
          <Route path='/channels/:channelId' component={Messages} />
        </Route>
      </Router>
    </ApolloProvider>
  </AppContainer>
)

render(root, document.querySelector('#app'))

if (module.hot) {
  module.hot.accept('./components/App', () => {
    const App = require('./components/App').default
    render(
      <AppContainer>
        <ApolloProvider client={client}>
          <Router history={browserHistory}>
            <Route path='/' component={App}>
              <Route component={Login} path='login' />
              <Route component={Messages} path='/channels/:channelId' />
            </Route>
            <Route path='/createChannel' component={CreateChannel} />
          </Router>
        </ApolloProvider>
      </AppContainer>,
      document.querySelector('#app')
    )
  })
}
