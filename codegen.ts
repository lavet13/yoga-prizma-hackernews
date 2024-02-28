import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/types',
  emitLegacyCommonJSImports: false,
  generates: {
    './src/graphql/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../../main#ContextValue',
      },
    },
  },

  config: {
    mappers: {
      Link: '../../../node_modules/.prisma/client#Link as LinkModel',
      Comment: '../../../node_modules/.prisma/client#Comment as CommentModel',
      User: '../../../node_modules/.prisma/client#User as UserModel',
    },
    inputMaybeValue: 'undefined | T',
  },

  watch: true,
};

export default config;
