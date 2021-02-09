import { ObjectType, Field, ID, InputType, Authorized } from 'type-graphql';

export class User {
  id!: number;
  first_name!: string;
  last_name!: string;
  email!: string;
  dob!: Date;
  password!: string;
  created_at!: Date;
  updated_at!: Date;
}

@ObjectType()
export class UserQuery implements Partial<User> {
  @Field((_type) => ID)
  id!: number;
  @Field()
  first_name!: string;
  @Field()
  last_name!: string;
  @Field()
  email!: string;
  @Authorized()
  dob!: Date;
}

@InputType()
export class UserInput implements Partial<User> {
  @Field()
  first_name!: string;
  @Field()
  last_name!: string;
  @Field()
  email!: string;
  @Field()
  password!: string;
}
