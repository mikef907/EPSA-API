import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import {
  IStaff,
  StaffUpdate,
  StaffQuery,
  StaffInput,
} from '../../classes/staff';
import { IUser } from '../../classes/user';
import { knex } from '../../database/connection';
import { IRole } from '../../classes/role';

@Resolver((_of) => IStaff)
export class StaffResolver {
  @Query((_returns) => [StaffQuery])
  async allStaff() {
    return await knex
      .select(['*', 'staff.id'])
      .join('users', 'staff.userId', '=', 'users.id')
      .from('staff')
      .then(async (results) => {
        return results.map((result) => {
          const staff: IStaff = {
            id: result.id,
            userId: result.userId,
            start: result.start,
            img: result.img,
            description: result.description,
            user: {
              id: result.userId,
              first_name: result.first_name,
              last_name: result.last_name,
              email: result.email,
              roles: [],
            },
          };
          return staff;
        });
      });
  }

  @Query((_returns) => StaffQuery)
  async staff(@Arg('id') id: number) {
    return await knex
      .select(['*', 'staff.id'])
      .where({ 'staff.id': id })
      .join('users', 'staff.userId', '=', 'users.id')
      .from('staff')
      .first()
      .then(async (result) => {
        const staff: IStaff = {
          id: result.id,
          userId: result.userId,
          start: result.start,
          img: result.img,
          description: result.description,
          user: {
            id: result.userId,
            first_name: result.first_name,
            last_name: result.last_name,
            email: result.email,
            roles: [],
          },
        };
        return staff;
      });
  }

  @Mutation((_returns) => Number)
  @Authorized('Admin')
  async addStaff(@Arg('staff') staff: StaffInput) {
    try {
      return await knex.transaction(async (trx) => {
        const _user: Partial<IUser> = Object.assign({}, staff.user);
        const _staff: Partial<IStaff> = Object.assign({}, staff);

        delete _staff.user;
        delete _staff.id;
        delete _user.id;

        const result = await trx('staff').insert(_staff).returning('id');

        const role = await this.getStaffRole();

        await trx('user_role').insert({
          userId: _staff.userId,
          roleId: role.id,
        });

        return result[0];
      });
    } catch {
      return null;
    }
  }

  @Mutation((_returns) => Boolean)
  @Authorized('Admin', 'Staff')
  async updateStaff(@Arg('staff') staff: StaffUpdate) {
    try {
      return await knex.transaction(async (trx) => {
        const _user: Partial<IUser> = Object.assign({}, staff.user);
        const _staff: Partial<IStaff> = Object.assign({}, staff);

        delete _staff.user;
        delete _staff.id;
        delete _staff.userId;
        delete _user.id;

        await trx('staff').update(_staff).where({
          id: staff.id,
        });

        await trx('users').update(_user).where({
          id: staff.userId,
        });

        return true;
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Mutation((_returns) => Boolean)
  @Authorized('Admin')
  async removeStaff(@Arg('id') id: number) {
    try {
      return knex.transaction(async (trx) => {
        await trx<IStaff>('staff').where({ userId: id }).delete();
        const role = await this.getStaffRole();
        await trx('user_role').where({ userId: id, roleId: role.id }).delete();
        return true;
      });
    } catch {
      return false;
    }
  }

  @Mutation(() => Boolean)
  @Authorized('Admin', 'Staff')
  async uploadAvatar(
    @Arg('file', (type) => GraphQLUpload) file: FileUpload,
    @Arg('userId') userId: number
  ): Promise<Boolean> {
    return new Promise(async (resolve, reject) =>
      file
        .createReadStream()
        .pipe(
          createWriteStream(
            __dirname + `/../../../../../images/${file.filename}`
          )
        )
        .on('finish', async () => {
          await knex<IStaff>('staff')
            .update({ img: file.filename })
            .where({ userId });
          return resolve(true);
        })
        .on('error', () => reject(false))
    );
  }

  private getStaffRole = async () =>
    (await knex
      .select<IRole>('*')
      .where({ name: 'Staff' })
      .from('roles')
      .first()) as IRole;
}
