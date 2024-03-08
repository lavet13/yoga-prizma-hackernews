import { GraphQLError, GraphQLFieldResolver } from 'graphql';

import { ResolversComposition } from '@graphql-tools/resolvers-composition';
import { ContextValue } from '../../context';

type AuthenticatedResolver = GraphQLFieldResolver<any, ContextValue, any>;

export const isAuthenticated =
  (): ResolversComposition<AuthenticatedResolver> =>
  next =>
  (parent, args, context, info) => {
    if (!context.me) {
      throw new GraphQLError('You are not authenticated!');
    }

    return next(parent, args, context, info);
  };
