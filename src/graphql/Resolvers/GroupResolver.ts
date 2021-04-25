import { Arg, Args, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import {
  GetGroupsArgs,
  Group,
  GroupInput,
  GroupQuery,
} from '../../classes/group';
import { User } from '../../classes/user';
import { knex } from '../../database/connection';

const baseQuery = knex<Group>('groups')
  .select(
    'groups.*',
    'users.first_name',
    'users.last_name',
    'users.email',
    'staff.id as staffId',
    'staff.img'
  )
  .join('users', 'users.id', '=', 'groups.facilitatorId')
  .join('staff', 'staff.userId', '=', 'users.id');

@Resolver((_of) => Group)
export class GroupResolver {
  @Query((_returns) => [GroupQuery])
  async groups(@Args() { take, zipCode, language }: GetGroupsArgs) {
    let q = baseQuery;

    if (zipCode) q = q.where({ zipCode });

    if (language) q = q.where({ language });

    if (take) q = q.limit(take);

    return await q.then((groups) =>
      groups.map((group) => this.mapGroup(group))
    );
  }

  @Query((_returns) => GroupQuery)
  async group(
    @Arg('id') id: number,
    @Arg('withUsers') withUsers: boolean = false
  ) {
    let q = baseQuery
      .where('groups.id', '=', id)
      .first()
      .then((group) => {
        if (group) return this.mapGroup(group);
        else throw new Error('Group not found');
      });

    if (withUsers) {
      return await q.then(async (group) => {
        if (group) {
          group.users = await knex<User>('users')
            .select('id', 'first_name', 'last_name', 'email')
            .where('user_group.groupId', '=', group.id)
            .join('user_group', 'user_group.userId', '=', 'users.id');

          return group;
        }
      });
    } else return await q;
  }

  @Mutation((_returns) => GroupQuery)
  @Authorized('Staff', 'Admin')
  async createGroup(@Arg('group') groupInput: GroupInput) {
    const result = await knex<Group>('groups')
      .insert(groupInput)
      .returning('*');
    return result[0];
  }

  @Mutation((_returns) => Boolean)
  @Authorized('Staff', 'Admin')
  async updateGroup(
    @Arg('id') id: number,
    @Arg('group') groupInput: GroupInput
  ) {
    await knex<Group>('groups').update(groupInput).where({ id });
    return true;
  }

  @Mutation((_returns) => Boolean)
  @Authorized('Staff', 'Admin')
  async deleteGroup(@Arg('id') id: number) {
    await knex<Group>('groups').delete().where({ id });
  }

  private mapGroup(group: any) {
    group.facilitator = {
      id: group.staffId,
      img: group.img,
      user: {
        id: group.facilitatorId,
        first_name: group.first_name,
        last_name: group.last_name,
        email: group.email,
      },
    };
    return group;
  }
}
