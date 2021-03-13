import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
//import { Stream } from 'stream';
import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { Staff, StaffInput, StaffQuery } from '../../classes/staff';
import { User } from '../../classes/user';
import { knex } from '../../database/connection';

// export interface Upload {
//   filename: string;
//   mimetype: string;
//   encoding: string;
//   createReadStream: () => Stream;
// }

@Resolver((_of) => Staff)
export class StaffResolver {
  @Query((_returns) => [StaffQuery])
  async allStaff() {
    return await knex
      .select(['*', 'staff.id'])
      .join('users', 'staff.userId', '=', 'users.id')
      .from('staff')
      .then(async (results) => {
        return results.map((result) => {
          const staff: Staff = {
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
        const staff: Staff = {
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

  @Mutation((_returns) => StaffQuery)
  async addStaff(@Arg('staff') staff: StaffInput) {}

  @Mutation((_returns) => Boolean)
  async updateStaff(@Arg('staff') staff: StaffInput) {
    try {
      return await knex.transaction(async (trx) => {
        const _user: Partial<User> = Object.assign({}, staff.user);
        const _staff: Partial<Staff> = Object.assign({}, staff);

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
    } catch {
      return false;
    }
  }

  @Mutation((_returns) => Boolean)
  async removeStaff() {}

  @Mutation(() => Boolean)
  @Authorized()
  async uploadAvatar(
    @Arg('file', (type) => GraphQLUpload) file: FileUpload,
    @Arg('userId') userId: number
  ): Promise<Boolean> {
    return new Promise(async (resolve, reject) =>
      file
        .createReadStream()
        .pipe(
          createWriteStream(__dirname + `/../../../../images/${file.filename}`)
        )
        .on('finish', async () => {
          await knex<Staff>('staff')
            .update({ img: file.filename })
            .where({ userId });
          return resolve(true);
        })
        .on('error', () => reject(false))
    );
  }
}
