import express from 'express';
import 'reflect-metadata';
import initDB from './database';
import { AuthChecker, buildSchema } from 'type-graphql';
import { UserResolver } from './graphql/Resolvers/UserResolver';
import { Context } from './context';
import { JwtSignature } from './config';
import { verify } from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express';
import { EventResolver } from './graphql/Resolvers/EventResolver';

export const customAuthChecker: AuthChecker<Context> = (
  { root, args, context, info },
  roles
) => {
  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
  const authHeader = context?.req?.headers?.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (verify(token, JwtSignature, { issuer: 'pipa', audience: 'api' }))
      return true;
  }
  return false;
};

async function main() {
  console.log('Starting Server...');
  // Construct a schema, using GraphQL schema language
  var schema = await buildSchema({
    resolvers: [UserResolver, EventResolver],
    authChecker: customAuthChecker,
  });

  await initDB().then(
    async () => {
      console.log('Database initialized');
    },
    (err) => console.error('Error initializing database', err)
  );

  var app = express();

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const context = {
        req,
      };
      return context;
    },
  });

  server.applyMiddleware({ app });

  app.listen(4000);
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
}

main();
