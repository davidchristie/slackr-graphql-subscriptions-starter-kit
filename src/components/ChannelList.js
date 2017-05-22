import gql from 'graphql-tag'
import React from 'react'
import { compose, graphql } from 'react-apollo'
import { Link } from 'react-router-dom'

const GET_PUBLIC_CHANNELS_QUERY = gql`
query GetPublicChannels($where: ChannelWhereArgs, $orderBy: [ChannelOrderByArgs]) {
  viewer {
    allChannels(where: $where, orderBy: $orderBy) {
      edges {
        node {
          id
          isPublic
          name
        }
      }
    }
  }
}
`

const NEW_CHANNELS_SUBSCRIPTION = gql`
  subscription NewChannels($subscriptionFilter:ChannelSubscriptionFilter) {
    subscribeToChannel(mutations:[createChannel], filter: $subscriptionFilter) {
      edge {
        node {
          createdAt
          id
          isPublic
          name
        }
      }
    }
  }
`

class ChannelList extends React.Component {

  componentDidMount () {
    this.subscription = this.props.data.subscribeToMore({
      document: NEW_CHANNELS_SUBSCRIPTION,
      variables: {
        subscriptionFilter: {
          isPublic: {
            eq: true
          }
        }
      },
      updateQuery: (previous, { subscriptionData }) => {
        const newEdges = [
          ...previous.viewer.allChannels.edges,
          subscriptionData.data.subscribeToChannel.edge
        ]
        newEdges.sort((a, b) => {
          if (a.node.name < b.node.name) return -1
          else if (a.node.name > b.node.name) return 1
          else return 0
        })
        return {
          ...previous,
          viewer: {
            ...previous.viewer,
            allChannels: {
              ...previous.viewer.allChannels,
              edges: newEdges
            }
          }
        }
      }
    })
  }

  componentWillUnmount () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  render () {
    return (
      <div>
        <h3>
          Channels
          <a href='https://scaphold.io'>
            <img
              alt=''
              src='https://scaphold.io/5d9897e87a7c597b0589f95cde19ad9d.png'
              style={{
                float: 'right',
                height: '30px',
                width: '30px'
              }}
              target='_blank'
            />
          </a>
        </h3>
        {
          this.props.data.viewer
            ? (
              <ul
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  height: '60vh',
                  listStyle: 'none',
                  overflowY: 'scroll'
                }}
              >
                {
                  this.props.data.viewer.allChannels.edges.map(edge => (
                    <li key={edge.node.id}>
                      <Link
                        style={{
                          color: 'white'
                        }}
                        to={`/channels/${edge.node.id}`}
                      >
                        {edge.node.name}
                      </Link>
                    </li>
                  ))
                }
              </ul>
            )
            : null
        }
      </div>
    )
  }

}

const withData = compose(
  graphql(GET_PUBLIC_CHANNELS_QUERY, {
    options: (props) => {
      return {
        variables: {
          where: {
            isPublic: {
              eq: true
            }
          },
          orderBy: [
            {
              field: 'name',
              direction: 'ASC'
            }
          ]
        }
      }
    }
  })
)

export default withData(ChannelList)
