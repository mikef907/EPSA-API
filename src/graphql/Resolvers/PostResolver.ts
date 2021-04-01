import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { Post, PostInput, PostQuery } from '../../classes/post';
import { knex } from '../../database/connection';

@Resolver((_of) => Post)
export class PostResolver {
  @Query((_returns) => [PostQuery])
  async allPosts() {
    return await knex('posts');
  }

  @Query((_returns) => PostQuery)
  async post(@Arg('id') id: number) {
    return await knex('posts').where({ id }).first();
  }

  @Mutation((_returns) => Number)
  @Authorized('Staff')
  async addPost(@Arg('post') post: PostInput) {
    return await knex('posts').insert(post).returning('id').first();
  }

  @Mutation((_returns) => Boolean)
  async updatePost(@Arg('post') post: PostInput) {
    if (post.id) {
      await knex('posts').update(post).where({ id: post.id });
      return true;
    } else return false;
  }

  @Mutation((_returns) => Boolean)
  async removePost(@Arg('id') id: number) {
    await knex('posts').where({ id }).delete();
    return true;
  }
}
