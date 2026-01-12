// src/graphql/apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { authHeaderToPost, TeacherLoginAPI } from "@/_services/api.js";

// Use TeacherLoginAPI for GraphQL
export const graphQLAPI = TeacherLoginAPI;

const httpLink = createHttpLink({ uri: `${graphQLAPI}/graphql` });

const authLink = setContext((_, { headers }) => {
  const extra = authHeaderToPost(); // returns { Authorization, Content-Type, view }
  return { headers: { ...headers, ...extra } };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default client;
