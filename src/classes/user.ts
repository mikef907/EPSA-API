import {
  ObjectType,
  Field,
  ID,
  InputType,
  Authorized,
  ArgsType,
} from 'type-graphql';

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

@ArgsType()
export class UserLogin implements Partial<User> {
  @Field()
  email!: string;
  @Field()
  password!: string;
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
  @Field()
  dob!: Date;
}

@InputType()
export class UserInput extends UserLogin implements Partial<User> {
  @Field()
  first_name!: string;
  @Field()
  last_name!: string;
  @Field()
  email!: string;
  @Field()
  password!: string;
  @Field()
  dob!: Date;
}
