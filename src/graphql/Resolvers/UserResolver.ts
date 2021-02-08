import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { User, UserInput, UserQuery } from '../../classes/user';
import { knex } from '../../database/connection';

@Resolver((_of) => User)
export class UserResolver {
  private readonly props = ['id', 'first_name', 'last_name', 'email'];

  @Query((_returns) => [UserQuery])
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
    var result = await knex<User>('users')
      .returning(this.props)
      .insert<User[]>(newUser);

    return result[0];
  }
}
