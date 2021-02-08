import { Query, Resolver } from 'type-graphql';
import { User } from '../../classes/user';
import { knex } from '../../database/connection';

@Resolver((_of) => User)
export class UserResolver {
  @Query((_returns) => [User])
  async users() {
    return await knex<User>('users').select('*');
  }
}
