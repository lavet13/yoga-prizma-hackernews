import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Resolvers } from '../../__generated__/types';
import { GraphQLError } from 'graphql';
import { parseIntSafe } from '../../../utils/resolvers/parseIntSafe';
import { Prisma } from '@prisma/client';
import { applyConstraints } from '../../../utils/resolvers/applyConstraints';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { isAuthenticated } from '../../composition/auth';

const resolvers: Resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    me(_, __, context) {
      return context.prisma.user.findUnique({
        where: {
          id: context.me!.id,
        },
      });
    },

    feed: (_, args, context) => {
      const filterNeedle = args.filterNeedle;
      const where: Prisma.LinkWhereInput = filterNeedle
        ? {
            OR: [
              { description: { contains: filterNeedle } },
              { url: { contains: filterNeedle } },
            ],
          }
        : {};

      const take = applyConstraints({
        type: 'take',
        min: 1,
        max: 50,
        value: args.take ?? 30,
      });

      const skip = applyConstraints({
        type: 'skip',
        min: 0,
        max: 50,
        value: args.skip ?? 0,
      });

      return context.prisma.link.findMany({
        where,
        take,
        skip,
      });
    },

    async comment(_, args, context) {
      const comment = await context.prisma.comment.findUnique({
        where: {
          id: parseInt(args.id),
        },
      });

      return comment;
    },

    async link(_, args, context) {
      const link = await context.prisma.link.findUnique({
        where: {
          id: parseInt(args.id),
        },
      });

      return link;
    },
  },

  Link: {
    async comments(parent, _, context) {
      return context.prisma.comment.findMany({
        where: {
          linkId: parent.id,
        },
      });
    },
    async postedBy(parent, _, context) {
      if (parent.userId === null) return null;

      return context.prisma.user.findUnique({
        where: {
          id: parent.userId,
        },
      });
    },
    async votes(parent, _, context) {
      return context.prisma.vote.findMany({
        where: {
          linkId: parent.id,
        },
      });
    },
  },

  Vote: {
    link(parent, _, context) {
      return context.prisma.link.findUniqueOrThrow({
        where: {
          id: parent.linkId,
        },
      });
    },
    user(parent, _, context) {
      return context.prisma.user.findUniqueOrThrow({
        where: {
          id: parent.userId,
        },
      });
    },
  },

  User: {
    links(parent, _, context) {
      return context.prisma.link.findMany({
        where: {
          userId: parent.id,
        },
      });
    },
  },

  Comment: {
    link(parent, _, context) {
      if (parent.linkId === null) return null;

      return context.prisma.link.findUnique({
        where: {
          id: parent.linkId,
        },
      });
    },
  },

  Mutation: {
    async signup(_, args, context) {
      const password = await bcrypt.hash(args.password, 10);

      const user = await context.prisma.user.create({
        data: {
          ...args,
          password,
        },
      });

      const token = jwt.sign({ userId: user.id }, import.meta.env.VITE_SECRET);

      return { token };
    },
    async login(_, args, context) {
      const user = await context.prisma.user.findUnique({
        where: {
          email: args.email,
        },
      });

      if (!user) {
        throw Error('No such user found!');
      }

      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) {
        throw Error('Invalid password!');
      }

      const token = jwt.sign({ userId: user.id }, import.meta.env.VITE_SECRET);

      return { token };
    },
    async postLink(_, args, context) {
      const description = args.description;
      if (description.length === 0) {
        return Promise.reject(
          new GraphQLError(
            `Cannot post empty description of the link '${args.description}'`,
          ),
        );
      }

      let url;

      try {
        url = new URL(args.url);
      } catch (err: unknown) {
        return Promise.reject(new GraphQLError('Invalid URL!'));
      }

      const newLink = await context.prisma.link.create({
        data: {
          url: url!.href,
          description,
          User: {
            connect: {
              id: context.me!.userId,
            },
          },
        },
      });

      context.pubSub.publish('newLink', { newLink });

      return newLink;
    },

    async postCommentOnLink(_, args, context) {
      const linkId = parseIntSafe(args.linkId);
      const body = args.body;

      if (body.length === 0) {
        return Promise.reject(
          new GraphQLError(
            `Cannot post empty comment with body '${args.body}'`,
          ),
        );
      }

      if (linkId === null) {
        return Promise.reject(
          new GraphQLError(
            `Cannot post comment on non-existing link with id '${args.linkId}'`,
          ),
        );
      }

      const comment = await context.prisma.comment
        .create({
          data: {
            linkId: linkId,
            body,
          },
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2003'
          ) {
            return Promise.reject(
              new GraphQLError(
                `Cannot post comment on non-existing link with id \`${args.linkId}\`.`,
              ),
            );
          }

          return Promise.reject(err);
        });

      return comment;
    },
    async unvote(_, args, context) {
      const linkId = Number(args.linkId);
      const userId = context.me!.userId;

      const deletedVote = await context.prisma.vote
        .delete({
          where: {
            linkId_userId: {
              userId,
              linkId,
            },
          },
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            return Promise.reject(
              new GraphQLError(
                'Record was already deleted or cannot be found!',
              ),
            );
          }

          return Promise.reject(err);
        });

      return deletedVote;
    },
    async vote(_, args, context) {
      const linkId = Number(args.linkId);
      const userId = context.me!.userId;
      console.log({ linkId, userId });

      const vote = await context.prisma.vote.findUnique({
        where: {
          linkId_userId: {
            userId,
            linkId,
          },
        },
      });

      if (vote !== null) {
        throw new GraphQLError(
          `Already voted for link with id \`${args.linkId}\``,
        );
      }

      const newVote = await context.prisma.vote.create({
        data: {
          linkId,
          userId,
        },
      });

      context.pubSub.publish('newVote', { newVote });

      return newVote;
    },
  },

  Subscription: {
    newLink: {
      subscribe(_, __, context) {
        return context.pubSub.subscribe('newLink');
      },
    },
    newVote: {
      subscribe(_, __, context) {
        return context.pubSub.subscribe('newVote');
      },
    },
  },
};

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  'Query.me': [isAuthenticated()],
  'Mutation.postLink': [isAuthenticated()],
  'Mutation.postCommentOnLink': [isAuthenticated()],
  'Mutation.vote': [isAuthenticated()],
  'Mutation.unvote': [isAuthenticated()],
};

export default composeResolvers(resolvers, resolversComposition);
