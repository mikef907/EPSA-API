import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { User, UserInput, UserLogin, UserQuery } from '../../classes/user';
import { knex } from '../../database/connection';
import argon2 from 'argon2';
import { JwtSignature } from '../../config';
import { sign } from 'jsonwebtoken';

@Resolver((_of) => User)
export class UserResolver {
  private readonly props = ['id', 'first_name', 'last_name', 'email'];

  @Query((_returns) => [UserQuery])
  @Authorized()
  async users() {
    return await knex.select<User>(this.props).from('users');
  }

  @Query((_returns) => UserQuery)
  async user(@Arg('id') id: number) {
    return await knex<User>('users')
      .where({ id })
      .select<User>(this.props)
      .first();
  }

  @Mutation((_returns) => UserQuery)
  async addUser(@Arg('data') newUser: UserInput) {
    newUser.password = await argon2.hash(newUser.password);

    var result = await knex<User>('users')
      .returning(this.props)
      .insert<User[]>(newUser);

    return result[0];
  }

  @Query((_returns) => String)
  async login(@Args() login: UserLogin) {
    return await knex<User>('users')
      .where({ email: login.email })
      .first()
      .then(async (user) => {
        if (user) {
          if (await argon2.verify(user.password as string, login.password)) {
            delete user.password;
            delete user.created_at;
            delete user.updated_at;
            return sign({ user: user }, JwtSignature, {
              issuer: 'pipa',
              audience: 'api',
            });
          }
        }
        throw new Error('Bad Login');
      });
  }
}
