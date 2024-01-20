import gql from 'graphql-tag';

export default gql`
  type Query {
    me: User
  }

  type User {
    username: String!
  }
`;
