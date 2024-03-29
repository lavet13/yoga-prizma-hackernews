import 'dotenv/config';
import { createYoga } from 'graphql-yoga';
import express from 'express';

import { makeExecutableSchema } from '@graphql-tools/schema';
// import { useResponseCache } from '@graphql-yoga/plugin-response-cache';

import typeDefs from './graphql/types';
import resolvers from './graphql/resolvers';
import main from './script';
import { createContext } from './context';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function bootstrap() {
  const app = express();

  // console.log({ dev: import.meta.env.DEV, prod: import.meta.env.PROD });
  // console.log({ importEnv: import.meta.env });
  // console.log({ processEnv: process.env });

  const yoga = createYoga({
    schema,
    context: createContext,
    graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
    graphiql: import.meta.env.DEV,
    landingPage: import.meta.env.PROD,
    plugins: [
      // useResponseCache({
      //   // global cache
      //   session: () => null,
      // }),
    ],
  });

  app.use(import.meta.env.VITE_GRAPHQL_ENDPOINT, yoga);

  // await main();

  if (import.meta.env.PROD) {
    console.log('help?');
    app.listen(import.meta.env.VITE_PORT, () => {
      console.log(
        `🚀 Query endpoint ready at http://localhost:${import.meta.env.VITE_PORT
        }${import.meta.env.VITE_GRAPHQL_ENDPOINT}`
      );
    });
  }

  return app;
}

const app = bootstrap();
export const viteNodeApp = app;
