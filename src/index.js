import React from 'react'
import { ApolloProvider } from 'react-apollo'
import { render } from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'

import Channel from './components/Channel'
import CreateChannel from './components/CreateChannel'
import Layout from './components/Layout'
import Login from './components/Login'
import config from './config'
import makeApolloClient from './utilities/makeApolloClient'

const client = makeApolloClient(config.scapholdUrl)

const root = (
  <ApolloProvider client={client}>
    <Router>
      <Layout>
        <Route component={CreateChannel} path='/createChannel' />
        <Route component={Channel} path='/channels/:channelId' />
        <Route component={Login} path='/login' />
      </Layout>
    </Router>
  </ApolloProvider>
)

render(root, document.querySelector('#root'))
