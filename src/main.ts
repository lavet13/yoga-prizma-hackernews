import 'dotenv/config';
import { createYoga } from 'graphql-yoga';
import express from 'express';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { useResponseCache } from '@graphql-yoga/plugin-response-cache';

import typeDefs from './graphql/types';
import resolvers from './graphql/resolvers';

export interface ContextValue {
  token?: string | string[];
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function bootstrap() {
  const app = express();

  // console.log({ endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT });
  // console.log({ importEnv: import.meta.env });
  // console.log({ processEnv: process.env });

  const yoga = createYoga({
    schema,
    graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
    landingPage: false,
    plugins: [
      useResponseCache({
        // global cache
        session: () => null,
      }),
    ],
  });

  app.use(import.meta.env.VITE_GRAPHQL_ENDPOINT, yoga);

  if (import.meta.env.PROD) {
    app.listen(import.meta.env.VITE_PORT, () => {
      console.log(
        `🚀 Query endpoint ready at http://localhost:${
          import.meta.env.VITE_PORT
        }`
      );
    });
  }

  return app;
}

const app = bootstrap();
export const viteNodeApp = app;
