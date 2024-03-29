import gql from 'graphql-tag';

export default gql`
  type Query {
    info: String!
    feed(filterNeedle: String, skip: Int, take: Int): [Link!]!
    comment(id: ID!): Comment
    link(id: ID!): Link
    me: User
  }

  type Mutation {
    postLink(url: String!, description: String!): Link!
    postCommentOnLink(linkId: ID!, body: String!): Comment!
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    vote(linkId: ID!): Vote
    unvote(linkId: ID!): Vote
  }

  type Vote {
    id: ID!
    link: Link!
    user: User!
  }

  type Subscription {
    newLink: Link!
    newVote: Vote!
  }

  type Link {
    id: ID!
    description: String!
    url: String!
    comments: [Comment!]!
    postedBy: User
    votes: [Vote!]!
  }

  type Comment {
    id: ID!
    body: String!
    link: Link
  }

  type AuthPayload {
    token: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    links: [Link!]!
  }
`;
