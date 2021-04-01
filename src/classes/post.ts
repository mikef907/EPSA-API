import { Field, ID, InputType, ObjectType } from 'type-graphql';

export class Post {
  id!: number;
  author!: number;
  published?: Date;
  headline!: string;
  imgUrl?: string;
  content!: string;
  created_at!: Date;
  updated_at!: Date;
}

@ObjectType()
export class PostQuery implements Partial<Post> {
  @Field((_type) => ID)
  id!: number;
  @Field()
  author!: number;
  @Field({ nullable: true })
  published?: Date;
  @Field()
  headline!: string;
  @Field({ nullable: true })
  imgUrl?: string;
  @Field()
  content!: string;
  @Field()
  created_at!: Date;
  @Field()
  updated_at!: Date;
}

@InputType()
export class PostInput implements Partial<Post> {
  @Field({ nullable: true })
  id?: number;
  @Field()
  author!: number;
  @Field({ nullable: true })
  published?: Date;
  @Field()
  headline!: string;
  @Field({ nullable: true })
  imgUrl?: string;
  @Field()
  content!: string;
}