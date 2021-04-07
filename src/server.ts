import express from 'express';
import 'reflect-metadata';
import initDB from './database';
import { AuthChecker, buildSchema } from 'type-graphql';
import { UserResolver } from './graphql/Resolvers/UserResolver';
import { Context } from './context';
import { IsLive, JwtSignature } from './config';
import { decode, verify } from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express';
import { EventResolver } from './graphql/Resolvers/EventResolver';
import { StaffResolver } from './graphql/Resolvers/StaffResolver';
import { graphqlUploadExpress } from 'graphql-upload';
import path from 'path';
import https from 'https';
import fs from 'fs';
import { PostResolver } from './graphql/Resolvers/PostResolver';

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

    if (verify(token, JwtSignature, { issuer: 'pipa', audience: 'api' })) {
      const decoded = decode(token) as any;

      if (
        roles.length > 0 &&
        !roles.some((role) =>
          decoded.user.roles.some((r: any) => r.name === role)
        )
      ) {
        return false;
      }

      return true;
    }
  }
  return false;
};

async function main() {
  console.log('Starting Server...');
  // Construct a schema, using GraphQL schema language
  var schema = await buildSchema({
    resolvers: [UserResolver, EventResolver, StaffResolver, PostResolver],
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
    uploads: false,
  });

  app.use(graphqlUploadExpress({ maxFiles: 1 }));

  app.use('/images', express.static(path.join(__dirname, '/../../../images')));

  server.applyMiddleware({ app, bodyParserConfig: { limit: '10mb' } });

  console.log('live', IsLive);

  if (IsLive) {
    const options = {
      key: fs.readFileSync('/etc/letsencrypt/live/api.epsaak.org/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/api.epsaak.org/cert.pem'),
    };

    https.createServer(options, app).listen(443);
  } else {
    app.listen(4000);
    console.log(
      'Running a GraphQL API server at http://localhost:4000/graphql'
    );
  }
}

main();
