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

  Mutation: {
    postLink(root, args) {
      const { url, description } = args;

      let idCount = links.length;

      const link: Link = {
        id: `link-${idCount}`,
        description,
        url,
      };

      links.push(link);

      return link;
    },
  },
};

export default resolvers;
