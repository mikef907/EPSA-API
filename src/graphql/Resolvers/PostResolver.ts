import { isMagnetURI } from 'class-validator';
import { decode } from 'jsonwebtoken';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Post, PostInput, PostQuery } from '../../classes/post';
import { Context } from '../../context';
import { knex } from '../../database/connection';

@Resolver((_of) => Post)
export class PostResolver {
  @Query((_returns) => [PostQuery])
  async allPosts() {
    var posts = await knex('posts')
      .select([
        '*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'staff.img',
        'staff.start',
        'staff.description',
      ])
      .join('staff', 'posts.authorId', '=', 'staff.id')
      .join('users', 'users.id', '=', 'staff.userId')
      .from('posts');

    console.log('posts', posts);

    return posts.map((p) => {
      p.author = {
        user: {
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
        },
        img: p.img,
        description: p.description,
        start: p.start,
      };
      return p;
    });
  }

  @Query((_returns) => PostQuery)
  async post(@Arg('id') id: number) {
    return await knex('posts').where({ id }).first();
  }

  @Mutation((_returns) => Number)
  @Authorized(['Staff', 'Admin'])
  async addPost(@Arg('post') post: PostInput, @Ctx() ctx: Context) {
    const token = ctx.req.headers.authorization?.split(' ')[1] as string;
    const decoded = decode(token) as any;

    const staffId = await knex('staff')
      .select('id')
      .where({ userId: decoded.user.id })
      .first();

    post.authorId = staffId;

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
}
