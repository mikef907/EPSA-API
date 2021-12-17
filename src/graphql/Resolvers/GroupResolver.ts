import { ValidationError } from 'apollo-server-errors';
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
  GetGroupsArgs,
  IGroup,
  GroupInput,
  GroupQuery,
} from '../../classes/group';
import { IUser, parseUserFromContext } from '../../classes/user';
import { Context } from '../../context';
import { knex } from '../../database/connection';

const baseQuery = () =>
  knex<IGroup>('groups')
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

@Resolver((_of) => IGroup)
export class GroupResolver {
  @Query((_returns) => [GroupQuery])
  async groups(@Args() { take, zipCode, language, active }: GetGroupsArgs) {
    let q = baseQuery();

    if (zipCode) q = q.where({ zipCode });

    if (language) q = q.where({ language });

    if (take) q = q.limit(take);

    if (active) q = q.where('end', '>', new Date());

    return await q.then((groups) =>
      groups.map((group) => this.mapGroup(group))
    );
  }

  @Query((_returns) => GroupQuery)
  async group(
    @Arg('id') id: number,
    @Arg('withUsers') withUsers: boolean = false
  ) {
    let q = baseQuery()
      .where('groups.id', '=', id)
      .then((group) => {
        if (group[0]) return this.mapGroup(group[0]);
        else throw new Error('Group not found');
      });

    if (withUsers) {
      return await q.then(async (group) => {
        if (group) {
          group.users = await knex<IUser>('users')
            .select('id', 'first_name', 'last_name', 'email')
            .where('user_group.groupId', '=', group.id)
            .join('user_group', 'user_group.userId', '=', 'users.id');

          return group;
        }
      });
    } else return await q;
  }

  @Mutation((_returns) => Number)
  @Authorized('Staff')
  async createGroup(@Arg('group') groupInput: GroupInput) {
    const result = await knex<IGroup>('groups')
      .insert(groupInput)
      .returning('*');
    return result[0].id;
  }

  @Mutation((_returns) => Boolean)
  @Authorized('Staff')
  async updateGroup(
    @Arg('id') id: number,
    @Arg('group') groupInput: GroupInput
  ) {
    await knex<IGroup>('groups').update(groupInput).where({ id });
    return true;
  }

  @Mutation((_returns) => Boolean)
  @Authorized('Staff')
  async removeGroup(@Arg('id') id: number) {
    await knex<IGroup>('groups').delete().where({ id });
    return true;
  }

  @Mutation((_returns) => Boolean)
  @Authorized('User')
  async requestToJoin(@Arg('id') id: number, @Ctx() ctx: Context) {
    const user = parseUserFromContext(ctx);

    try {
      return await knex.transaction(async (trx) => {
        const count = await trx('user_group')
          .forUpdate('user_group')
          .where({ groupId: id });

        const group = await trx<IGroup>('groups')
          .select('limit')
          .where({ id })
          .first();

        if (count.length >= group!.limit) {
          throw new ValidationError('Group is full');
        }
        const result = await knex('user_group')
          .returning('groupId')
          .insert({ groupId: id, userId: user.id });

        return true;
      });
    } catch (error: any) {
      return new ValidationError(error.message);
    }
  }

  @Query((_returns) => [Number])
  @Authorized('User')
  async joinedGroups(@Ctx() ctx: Context) {
    const user = parseUserFromContext(ctx);

    const result = await knex('user_group')
      .select('groupId')
      .join('groups', 'id', '=', 'groupId')
      .where({ userId: user.id })
      .andWhere('groups.end', '>', new Date());

    return result.map((r) => r.groupId);
  }

  @Mutation((_returns) => Boolean)
  @Authorized('User')
  async requestToLeave(@Arg('id') id: Number, @Ctx() ctx: Context) {
    const user = parseUserFromContext(ctx);

    await knex('user_group').where({ userId: user.id, groupId: id }).delete();

    return true;
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
