import {
  ObjectType,
  Field,
  ID,
  InputType,
  Authorized,
  ArgsType,
} from 'type-graphql';
import { Role, RoleQuery } from './role';

export class User {
  id!: number;
  first_name!: string;
  last_name!: string;
  email!: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
  roles!: Role[];
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
  @Field((_type) => [RoleQuery])
  roles!: Role[];
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
}

@InputType()
export class UserResetPassword {
  @Field()
  nonce!: string;
  @Field()
  password!: string;
}
