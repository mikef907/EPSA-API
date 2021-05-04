import {
  ObjectType,
  Field,
  ID,
  InputType,
  ArgsType,
  InterfaceType,
} from 'type-graphql';
import { INonce } from './nonce';
import { IRole, RoleQuery } from './role';

@InterfaceType()
export abstract class IUserInput {
  @Field((_type) => ID)
  id?: number;
  @Field()
  first_name!: string;
  @Field()
  last_name!: string;
  @Field()
  email!: string;
  password?: string;
}

@InterfaceType({ implements: IUserInput })
export abstract class IUser extends IUserInput {
  @Field((_type) => ID)
  id!: number;
  @Field((_type) => [RoleQuery])
  roles!: IRole[];
  @Field()
  created_at?: Date;
  @Field()
  updated_at?: Date;
}

@ArgsType()
export class UsersArgs {
  @Field((type) => [String], { nullable: true })
  inRoles?: string[];
  @Field((type) => [String], { nullable: true })
  notInRoles?: string[];
}

@ArgsType()
export class UserLogin implements Partial<UserInput> {
  @Field()
  email!: string;
  @Field()
  password!: string;
}

@ObjectType({ implements: [IUser, IUserInput] })
export class UserQuery {}

@InputType()
export class UserInput extends IUserInput {
  @Field((_type) => ID, { nullable: true })
  id?: number;
  @Field()
  first_name!: string;
  @Field()
  last_name!: string;
  @Field()
  email!: string;
  password?: string;
}

@InputType()
export class NewUserInput extends UserInput {
  @Field()
  password!: string;
}

@InputType()
export class UserResetPassword implements Partial<IUser>, Partial<INonce> {
  @Field()
  nonce!: string;
  @Field()
  password!: string;
}
