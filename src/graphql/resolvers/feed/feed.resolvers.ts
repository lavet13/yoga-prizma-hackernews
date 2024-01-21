import { Resolvers, Link } from '../../__generated__/types';

const links: Link[] = [
  {
    id: 'link-0',
    url: 'https://graphql-yoga.com',
    description: 'The easiest way of setting up a GraphQL server',
  },
];

const resolvers: Resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,

    feed: () => links,
  },

  Link: {
    id: parent => parent.id,
    description: parent => parent.description,
    url: parent => parent.url,
  },
};

export default resolvers;
