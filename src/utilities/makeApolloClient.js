import ApolloClient, { createNetworkInterface } from 'apollo-client'
import {
  addGraphQLSubscriptions,
  SubscriptionClient
} from 'subscriptions-transport-ws'

export default function makeApolloClient (scapholdUrl) {
  const graphqlUrl = `https://${scapholdUrl}`
  const websocketUrl = `wss://${scapholdUrl}`
  const networkInterface = createNetworkInterface({uri: graphqlUrl})
  networkInterface.use([{
    applyMiddleware (request, next) {
      if (!request.options.headers) {
        request.options.headers = {}
      }
      const token = window.localStorage.getItem('scaphold_user_token')
      if (token) {
        request.options.headers.Authorization = `Bearer ${window.localStorage.getItem('token')}`
      }
      next()
    }
  }])
  const wsClient = new SubscriptionClient(websocketUrl)
  const clientGraphql = new ApolloClient({
    initialState: {},
    networkInterface: addGraphQLSubscriptions(networkInterface, wsClient)
  })
  return clientGraphql
}
