import { decode } from 'jsonwebtoken';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Post, PostInput, PostQuery } from '../../classes/post';
import { Context } from '../../context';
import { knex } from '../../database/connection';

const fields = [
  'posts.*',
  'users.first_name',
  'users.last_name',
  'users.email',
  'staff.img',
  'staff.start',
  'staff.description',
];

@Resolver((_of) => Post)
export class PostResolver {
  @Query((_returns) => [PostQuery])
  async allPosts() {
    var posts = await knex('posts')
      .select(fields)
      .join('staff', 'posts.authorId', '=', 'staff.userId')
      .join('users', 'users.id', '=', 'staff.userId')
      .from('posts');

    return posts.map((p) => this.mapPost(p));
  }

  @Query((_returns) => PostQuery)
  async post(@Arg('id') id: number) {
    const post = await knex('posts')
      .select(fields)
      .join('staff', 'posts.authorId', '=', 'staff.userId')
      .join('users', 'users.id', '=', 'staff.userId')
      .from('posts')
      .where('posts.id', id)
      .first();

    return this.mapPost(post);
  }

  @Mutation((_returns) => Number)
  @Authorized(['Staff', 'Admin'])
  async addPost(@Arg('post') post: PostInput, @Ctx() ctx: Context) {
    const token = ctx.req.headers.authorization?.split(' ')[1] as string;
    const decoded = decode(token) as any;

    const staff = await knex('staff')
      .select('userId')
      .where({ userId: decoded.user.id })
      .first();

    post.authorId = staff.userId;

    const result = await knex('posts').insert(post).returning('id');
    return result[0];
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

  private mapPost(post: any) {
    post.author = {
      user: {
        first_name: post.first_name,
        last_name: post.last_name,
        email: post.email,
      },
      img: post.img,
      description: post.description,
      start: post.start,
    };
    return post;
  }
}
