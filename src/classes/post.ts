import {
  ArgsType,
  Field,
  ID,
  InputType,
  Int,
  InterfaceType,
  ObjectType,
} from 'type-graphql';
import { IStaff, StaffQuery } from './staff';

@InterfaceType()
export abstract class IPostInput {
  @Field((type) => ID, { nullable: true })
  id?: number;
  @Field({ nullable: true })
  authorId?: number;
  @Field({ nullable: true })
  published?: Date;
  @Field()
  headline!: string;
  @Field({ nullable: true })
  imgUrl?: string;
  @Field()
  content!: string;
}

@InterfaceType({ implements: IPostInput })
export abstract class IPost extends IPostInput {
  @Field((_type) => StaffQuery, { nullable: true })
  author?: IStaff;
  @Field()
  created_at!: Date;
  @Field()
  updated_at!: Date;
}

@ObjectType({ implements: [IPost, IPostInput] })
export class PostQuery {}

@InputType()
export class PostInput {
  @Field((type) => ID, { nullable: true })
  id?: number;
  @Field({ nullable: true })
  authorId?: number;
  @Field({ nullable: true })
  published?: Date;
  @Field()
  headline!: string;
  @Field({ nullable: true })
  imgUrl?: string;
  @Field()
  content!: string;
}

@ArgsType()
export class GetPostsArgs {
  @Field((type) => Int, { nullable: true })
  take?: number;
  @Field({ nullable: true })
  isPublished?: boolean;
}
