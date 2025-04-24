import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Set up the HTTP link to connect to your GraphQL server
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Create the Apollo client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default client;