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
  IUser,
  MyProfileInput,
  NewUserInput,
  parseUserFromContext,
  UserInput,
  UserLogin,
  UserQuery,
  UserResetPassword,
  UsersArgs,
} from '../../classes/user';
import { knex } from '../../database/connection';
import argon2 from 'argon2';
import { AppRoot, JwtSignature } from '../../config';
import { sign } from 'jsonwebtoken';
import { INonce } from '../../classes/nonce';
import dayjs from 'dayjs';
import { v4 } from 'uuid';
import sendEmail from '../../sendEmail';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from 'apollo-server-express';
import { IRole } from '../../classes/role';
import { Context } from 'node:vm';

@Resolver((_of) => IUser)
export class UserResolver {
  private readonly props = [
    'users.id',
    'first_name',
    'last_name',
    'email',
    'confirmed',
  ];

  @Mutation((_returns) => Boolean)
  async confirmation(@Arg('token') token: string) {
    var nonce = await knex<INonce>('nonces')
      .where({ nonce: token, used: false })
      .andWhere('expiry', '>', new Date())
      .first();

    if (!nonce) return new AuthenticationError('Token is invalid');
    else {
      return await knex.transaction(async (trx) => {
        await trx<IUser>('users')
          .where({ id: nonce!.userId })
          .update({ confirmed: true });

        await trx<INonce>('nonces')
          .where({ nonce: nonce!.nonce })
          .update({ used: true });

        return true;
      });
    }
  }

  @Query((_returns) => Boolean)
  async resendConfirmation(@Ctx() ctx: Context) {
    var user = parseUserFromContext(ctx);

    if (!user.confirmed) {
      var nonce = await this.generateNonce(user.id);

      var confirmation = `<p>Hello ${user.first_name}</p>
      <p>Welcome to EPSA!&nbsp; To complete the registration process please click this <a href="${AppRoot}confirmation/${nonce.nonce}">link</a>.</p>
      <p>If the link does not work for you please copy and paste the url below into your browser window to complete the process.</p>
      <p>${AppRoot}confirmation/${nonce.nonce}</p>`;

      sendEmail(user.email, confirmation, 'EPSA Account Confirmation');
      return true;
    } else return false;
  }

  @Mutation((_returns) => Boolean)
  async resetPassword(@Arg('input') input: UserResetPassword) {
    var nonce = await knex<INonce>('nonces')
      .where({ nonce: input.nonce, used: false })
      .andWhere('expiry', '>', new Date())
      .first();

    if (!nonce) throw new AuthenticationError('Token is invalid');
    else {
      var password = await argon2.hash(input.password);

      return await knex.transaction(async (trx) => {
        await trx<IUser>('users')
          .update({ password })
          .where({ id: nonce!.userId });

        await trx<INonce>('nonces')
          .update({ used: true })
          .where({ nonce: nonce!.nonce, userId: nonce!.userId });

        return true;
      });
    }
  }

  @Mutation((_returns) => Boolean)
  async forgotPassword(@Arg('email') email: string) {
    var user = await knex<IUser>('users')
      .select<IUser>(this.props)
      .where({ email })
      .first();

    if (user) {
      var nonce = await this.generateNonce(user.id);

      const resetLink = `<p>Greetings!</p>
      <p>Here is a <a href="${AppRoot}reset-password/${nonce.nonce}">link</a> to reset your EPSA password.&nbsp;</p>
      <p>If this link does not work for your please copy and paste the url below into your browser window to complete the process.</p>
      <p>${AppRoot}reset-password/${nonce.nonce}</p>`;

      await sendEmail(user.email, resetLink, 'EPSA Password Reset');

      return true;
    }
    throw new AuthenticationError('Unable to find email');
  }

  @Query((_returns) => [UserQuery])
  @Authorized(['Admin'])
  async users(@Args() { inRoles, notInRoles }: UsersArgs) {
    const users = await knex
      .select(...this.props, 'name as role', 'roleId')
      .from('users')
      .join('user_role', 'user_role.userId', '=', 'users.id')
      .join('roles', 'user_role.roleId', '=', 'roles.id');

    return users
      .reduce((p: IUser[], c) => {
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
  @Authorized('Admin')
  async user(@Arg('id') id: number) {
    return await knex
      .select<IUser>(this.props)
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

  @Query((_returns) => UserQuery)
  @Authorized('User')
  async myProfile(@Ctx() ctx: Context) {
    const user = parseUserFromContext(ctx);

    const result = await knex<IUser>('users')
      .select<IUser>(this.props)
      .where({ id: user.id })
      .first();

    if (!result) {
      throw new ApolloError('User record not found');
    } else {
      result.roles = await this.getRoles(result.id);
      return result;
    }
  }

  @Mutation((_returns) => Boolean)
  @Authorized('User')
  async updateMyProfile(
    @Ctx() ctx: Context,
    @Arg('user') input: MyProfileInput
  ) {
    const user = parseUserFromContext(ctx);

    if (user.id !== parseInt(input.id))
      throw new AuthenticationError('User id mismatch');

    if (input.password) input.password = await argon2.hash(input.password);
    else delete input.password;

    delete input.id;

    await knex<IUser>('users').update(input).where({ id: user.id });

    return true;
  }

  @Mutation((_returns) => String)
  async addUser(@Arg('newUser') newUser: NewUserInput) {
    newUser.password = await argon2.hash(newUser.password);

    let user: IUser;

    try {
      user = await knex.transaction(async (trx) => {
        const _ = await knex<IUser>('users')
          .insert<IUser>(newUser)
          .returning('*');

        const user = _[0];

        var userRole = await knex<IRole>('roles')
          .where({ name: 'User' })
          .first();

        await knex('user_role').insert([
          {
            userId: user.id,
            roleId: userRole?.id,
          },
        ]);

        user.roles = await this.getRoles(user.id);
        return user;
      });
    } catch (err) {
      if (err.code == '23505')
        throw new UserInputError('Account with email already exists');
      else throw new ApolloError(err.message);
    }

    const nonce = await this.generateNonce(user.id);

    var confirmation = `<p>Hello ${user.first_name}</p>
    <p>Welcome to EPSA!&nbsp; To complete the registration process please click this <a href="${AppRoot}confirmation/${nonce.nonce}">link</a>.</p>
    <p>If the link does not work for you please copy and paste the url below into your browser window to complete the process.</p>
    <p>${AppRoot}confirmation/${nonce.nonce}</p>`;

    sendEmail(user.email, confirmation, 'EPSA Account Confirmation');

    return this.getToken(user);
  }

  @Mutation((_returns) => String)
  async updateUser(@Arg('data') user: UserInput) {
    if (user.password) user.password = await argon2.hash(user.password);

    try {
      return await knex<IUser>('users')
        .insert<IUser>(user)
        .returning('*')
        .then(async (_) => {
          const _user = _[0];

          var userRole = await knex<IRole>('roles')
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
    return await knex<IUser>('users')
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

  private async generateNonce(userId: number) {
    const nonce = await knex<INonce>('nonces')
      .returning(['nonce'])
      .insert<INonce[]>({
        nonce: v4(),
        userId: userId,
        expiry: dayjs().add(1, 'day').toDate(),
      });
    return nonce[0];
  }

  private async getRoles(userId: number) {
    return await knex
      .join('roles', 'user_role.roleId', '=', 'roles.id')
      .select('roles.id', 'roles.name')
      .where({ userId })
      .from('user_role');
  }

  private async getToken(
    user: IUser,
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
      issuer: 'epsa',
      audience: 'api',
    });
  }
}
