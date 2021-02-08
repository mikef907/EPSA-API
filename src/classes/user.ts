import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class User {
  @Field((_type) => ID)
  id!: number;
  @Field()
  first_name!: string;
  @Field()
  last_name!: string;
  @Field()
  email!: string;
  @Field()
  password!: string;
  @Field()
  created_at!: Date;
  @Field()
  updated_at!: Date;
}
