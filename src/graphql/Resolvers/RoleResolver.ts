import { Authorized, Query, Resolver } from 'type-graphql';
import { IRole, RoleQuery } from '../../classes/role';
import { knex } from '../../database/connection';

@Resolver((_of) => IRole)
export class RoleResolver {
  @Query((_type) => [RoleQuery])
  @Authorized('Admin')
  async roles() {
    return await knex<IRole>('roles');
  }
}
