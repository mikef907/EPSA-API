import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Staff, StaffInput, StaffQuery } from '../../classes/staff';
import { User } from '../../classes/user';
import { knex } from '../../database/connection';

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
        const _user: any = Object.assign({}, staff.user);
        const _staff: any = Object.assign({}, staff);

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
}
