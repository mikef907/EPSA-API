import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { GetPostsArgs, IPost, PostInput, PostQuery } from '../../classes/post';
import { parseUserFromContext } from '../../classes/user';
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

@Resolver((_of) => IPost)
export class PostResolver {
  @Query((_returns) => [PostQuery])
  async allPosts(@Args() { take, isPublished }: GetPostsArgs) {
    let q = knex('posts')
      .select(fields)
      .join('staff', 'posts.authorId', '=', 'staff.userId')
      .join('users', 'users.id', '=', 'staff.userId')
      .from('posts')
      .orderBy('posts.published', 'desc');

    if (isPublished === true) q = q.where('posts.published', '<=', new Date());
    else if (isPublished === false) q = q.where('posts.published', 'is', null);

    if (take) q = q.limit(take);

    const posts = await q;

    return posts.map((p) => this.mapPost(p));
  }

  @Query((_returns) => PostQuery)
  async post(@Arg('id') id: number) {
    const post = await knex('posts')
      .select(fields)
      .join('staff', 'staff.userId', '=', 'posts.authorId')
      .join('users', 'users.id', '=', 'posts.authorId')
      .from('posts')
      .where('posts.id', id)
      .first();

    return this.mapPost(post);
  }

  @Mutation((_returns) => Number)
  @Authorized(['Staff', 'Admin'])
  async addPost(@Arg('post') post: PostInput, @Ctx() ctx: Context) {
    const user = parseUserFromContext(ctx);

    const staff = await knex('staff')
      .select('userId')
      .where({ userId: user.id })
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
