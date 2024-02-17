import { Resolvers } from '../../__generated__/types';

const resolvers: Resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,

    feed: (_, __, context) => context.prisma.link.findMany(),
  },

  Mutation: {
    async postLink(_, args, context) {
      const { url, description } = args;

      const newLink = await context.prisma.link.create({
        data: {
          url,
          description,
        },
      });

      return newLink;
    },
  },
};

export default resolvers;
