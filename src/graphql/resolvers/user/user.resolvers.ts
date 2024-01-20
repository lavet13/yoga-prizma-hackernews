const resolvers = {
  Query: {
    me: () => {
      return {
        username: 'Ivan Skinder!',
      };
    },
  },
};

export default resolvers;
