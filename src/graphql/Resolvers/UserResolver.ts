import {
  Arg,
  Args,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import {
  NewUserInput,
  User,
  UserInput,
  UserLogin,
  UserQuery,
  UserResetPassword,
  UsersArgs,
} from '../../classes/user';
import { knex } from '../../database/connection';
import argon2 from 'argon2';
import { JwtSignature } from '../../config';
import { sign } from 'jsonwebtoken';
import { Nonce } from '../../classes/nonce';
import dayjs from 'dayjs';
import { v4 } from 'uuid';
import sendEmail from '../../sendEmail';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Role } from '../../classes/role';
import { Staff } from '../../classes/staff';

@Resolver((_of) => User)
export class UserResolver {
  private readonly props = ['users.id', 'first_name', 'last_name', 'email'];

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

      const resetLink = `<a href="http://localhost:3000/reset-password/${nonce[0].nonce}">reset link</a>`;

      console.log(resetLink);

      // await sendEmail(user.email, resetLink, 'Password Reset Link');

      return true;
    }
    throw new AuthenticationError('Unable to find email');
  }

  @Query((_returns) => [UserQuery])
  @Authorized(['Staff', 'Admin'])
  async users(@Args() { inRoles, notInRoles }: UsersArgs) {
    const users = await knex
      .select(...this.props, 'name as role', 'roleId')
      .from('users')
      .join('user_role', 'user_role.userId', '=', 'users.id')
      .join('roles', 'user_role.roleId', '=', 'roles.id');

    return users
      .reduce((p: User[], c) => {
        const idx = p.findIndex((_) => _.id === c.id);
        if (idx > -1) {
          p[idx].roles.push({ id: c.roleId, name: c.role });
        } else {
          p.push({
            id: c.id,
            first_name: c.first_name,
            last_name: c.last_name,
            email: c.email,
            roles: [
              {
                id: c.roleId,
                name: c.role,
              },
            ],
          });
        }
        return p;
      }, [])
      .filter(
        (user) =>
          !inRoles ||
          inRoles.length === 0 ||
          user.roles.some((role) => inRoles?.includes(role.name))
      )
      .filter(
        (user) =>
          !notInRoles ||
          notInRoles.length === 0 ||
          !user.roles.some((role) => notInRoles?.includes(role.name))
      );
  }

  @Query((_returns) => UserQuery)
  async user(@Arg('id') id: number) {
    return await knex
      .select<User>(this.props)
      .where({ id })
      .from('users')
      .first()
      .then(async (user) => {
        if (user) {
          user.roles = await this.getRoles(user.id);
        }

        return user;
      });
  }

  @Mutation((_returns) => String)
  async addUser(@Arg('newUser') newUser: NewUserInput) {
    newUser.password = await argon2.hash(newUser.password);

    try {
      return await knex<User>('users')
        .insert<User>(newUser)
        .returning('*')
        .then(async (_) => {
          const user = _[0];

          var userRole = await knex<Role>('roles')
            .where({ name: 'User' })
            .first();

          await knex('user_role').insert([
            {
              userId: user.id,
              roleId: userRole?.id,
            },
          ]);

          user.roles = await this.getRoles(user.id);
          return this.getToken(user);
        });
    } catch (err) {
      if (err.code == '23505')
        throw new UserInputError('Account with email already exists');
      else throw err;
    }
  }

  @Mutation((_returns) => String)
  async updateUser(@Arg('data') user: UserInput) {
    if (user.password) user.password = await argon2.hash(user.password);

    try {
      return await knex<User>('users')
        .insert<User>(user)
        .returning('*')
        .then(async (_) => {
          const _user = _[0];

          var userRole = await knex<Role>('roles')
            .where({ name: 'User' })
            .first();

          await knex('user_role').insert([
            {
              userId: _user.id,
              roleId: userRole?.id,
            },
          ]);

          _user.roles = await this.getRoles(_user.id);
          return this.getToken(_user);
        });
    } catch (err) {
      if (err.code == '23505')
        throw new UserInputError('Account with email already exists');
      else throw err;
    }
  }

  @Mutation((_returns) => String)
  async login(@Args() login: UserLogin) {
    return await knex<User>('users')
      .where({ email: login.email })
      .first()
      .then(async (user) => {
        if (user) {
          if (await argon2.verify(user.password as string, login.password)) {
            user.roles = await this.getRoles(user.id);

            let img: { value: string | null } | undefined | null;

            if (user.roles.some((r) => r.name === 'Staff')) {
              img = await knex('staff')
                .select<{ value: string | null }>('img as value')
                .where({ userId: user.id })
                .first();
            }

            return this.getToken(user, img);
          }
        }
        throw new AuthenticationError('Invalid email or password');
      });
  }

  private async getRoles(userId: number) {
    return await knex
      .join('roles', 'user_role.roleId', '=', 'roles.id')
      .select('roles.id', 'roles.name')
      .where({ userId })
      .from('user_role');
  }

  private async getToken(
    user: User,
    img: { value: string | null } | undefined | null = null
  ) {
    delete user.password;
    delete user.created_at;
    delete user.updated_at;

    const token = {
      user: user,
      img: img?.value,
    };

    return sign(token, JwtSignature, {
      issuer: 'pipa',
      audience: 'api',
    });
  }
}
