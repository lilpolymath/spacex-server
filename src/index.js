const { ApolloServer } = require('apollo-server');
const isEmail = require('isemail');

const { createStore } = require('./utils');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const UserAPI = require('./datasources/user');
const LaunchAPI = require('./datasources/launch');

const store = createStore();
const server = new ApolloServer({
  context: async ({ req }) => {
    const auth = (req.headers && req.headers.authorization) || '';
    const email = Buffer.from(auth, 'Base64').toString('ascii');

    if (!isEmail.validate(email)) return { user: null };

    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;

    return {
      user: { ...user.dataValues },
    };
  },
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store }),
  }),
});

server.listen({ port: process.env.PORT || 3000 }, () => {
  console.log(`🚀 Server ready at http://localhost:3000/graphql`);
});
