import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { ApolloProvider } from 'react-apollo'
import { render } from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'

import Channel from './components/Channel'
import CreateChannel from './components/CreateChannel'
import Layout from './components/Layout'
import Login from './components/Login'
import configuration from './configuration'
import createApolloClient from './utilities/createApolloClient'

const client = createApolloClient(configuration.scapholdUrl)

const root = (
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Layout>
        <Route exact path='/' render={props => <h3>Select a channel</h3>} />
        <Route component={CreateChannel} path='/createChannel' />
        <Route component={Channel} path='/channels/:channelId' />
        <Route component={Login} path='/login' />
      </Layout>
    </BrowserRouter>
  </ApolloProvider>
)

render(root, document.querySelector('#root'))
