import express from 'express';
import 'reflect-metadata';
import { graphqlHTTP } from 'express-graphql';
import initDB from './database';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './graphql/Resolvers/UserResolver';

async function main() {
  // Construct a schema, using GraphQL schema language
  var schema = await buildSchema({
    resolvers: [UserResolver],
  });

  var app = express();

  await initDB().then(
    async () => {
      console.log('Database initialized');
    },
    () => console.error('Error initializing database')
  );

  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      graphiql: true,
    })
  );

  app.listen(4000);
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
}

main();
