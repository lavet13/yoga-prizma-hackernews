import gql from 'graphql-tag';

export default gql`
  union SearchResult = Human | Droid | Starship

  type Query {
    hero(episode: Episode = JEDI): [Character!]!
    heroById(id: ID!): Character
    reviews: [Review!]!
    search(query: String = ""): [SearchResult!]!
  }

  enum Episode {
    NEWHOPE
    EMPIRE
    JEDI
  }

  enum LengthUnit {
    METER
    CENTIMETERS
  }

  type Review {
    stars: Int!
    commentary: String
  }

  input ReviewInput {
    stars: Int!
    commentary: String
  }

  type Mutation {
    createReview(episode: Episode!, review: ReviewInput!): Review!
    incrementCredits(id: ID!): Int!
  }

  type Starship {
    id: ID!
    name: String!
    length(unit: LengthUnit = METER): Float!
  }

  interface Character {
    id: ID!
    name: String!
    friends: [Character]!
    appearsIn: [Episode!]!
  }

  type Human implements Character {
    id: ID!
    name: String!
    friends: [Character]!
    appearsIn: [Episode!]!

    totalCredits: Int!
    starships: [Starship!]!
  }

  type Droid implements Character {
    id: ID!
    name: String!
    friends: [Character]!
    appearsIn: [Episode!]!

    primaryFunction: String
  }
`;
