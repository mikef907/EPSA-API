import express, { request } from 'express';
import 'reflect-metadata';
import { graphqlHTTP } from 'express-graphql';
import initDB from './database';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './graphql/Resolvers/UserResolver';
import { knex } from './database/connection';
import { Context } from './context';
import jwt from 'express-jwt'

async function main() {
  // Construct a schema, using GraphQL schema language
  var schema = await buildSchema({
    resolvers: [UserResolver],
    authChecker: ({ root, args, context: Context, info }, roles) => {
      
      const authHeader = context.req.headers.authorization;

      if(authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.
      }

      console.log(context);
      return false;
    },
  });

  var app = express();

  await initDB().then(
    async () => {
      console.log('Database initialized');
    },
    () => console.error('Error initializing database')
  );

  let context: Context = {
    req: app.request,
    res: app.response,
  };

  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      graphiql: true,
      context,
    })
  );

  app.listen(4000);
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
}

main();
