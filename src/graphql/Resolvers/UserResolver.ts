import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import {
  User,
  UserInput,
  UserLogin,
  UserQuery,
  UserResetPassword,
} from '../../classes/user';
import { knex } from '../../database/connection';
import argon2 from 'argon2';
import { JwtSignature } from '../../config';
import { sign } from 'jsonwebtoken';
import { Nonce } from '../../classes/nonce';
import dayjs from 'dayjs';
import { v4 } from 'uuid';
import sendEmail from '../../sendEmail';
import { AuthenticationError } from 'apollo-server';

@Resolver((_of) => User)
export class UserResolver {
  private readonly props = ['id', 'first_name', 'last_name', 'email'];

  @Mutation((_returns) => Boolean)
  async resetPassword(@Arg('input') input: UserResetPassword) {
    var nonce = await knex<Nonce>('nonces')
      .where({ nonce: input.nonce, used: false })
      .first();

    if (nonce) {
      if (dayjs(nonce.expiry).isAfter(dayjs())) {
        var password = await argon2.hash(input.password);

        await knex<User>('users')
          .update({ password })
          .where({ id: nonce.userId });

        await knex<Nonce>('nonces')
          .update({ used: true })
          .where({ nonce: nonce.nonce, userId: nonce.userId });

        return true;
      }
      return new AuthenticationError('Token is expired');
    }
    throw new AuthenticationError('Token is invalid');
  }

  @Mutation((_returns) => Boolean)
  async forgotPassword(@Arg('email') email: string) {
    var user = await knex<User>('users')
      .select<User>(this.props)
      .where({ email })
      .first();

    if (user) {
      var nonce = await knex<Nonce>('nonces')
        .returning(['nonce'])
        .insert<Nonce[]>({
          nonce: v4(),
          userId: user.id,
          expiry: dayjs().add(1, 'day').toDate(),
        });

      console.log(nonce);

      const resetLink = `<a href="http://localhost:3000/reset-password/${nonce[0].nonce}">reset link</a>`;

      console.log(resetLink);

      // await sendEmail(user.email, resetLink, 'Password Reset Link');

      return true;
    }
    throw new AuthenticationError('Unable to find email');
  }

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
        throw new AuthenticationError('Invalid email or password');
      });
  }
}
