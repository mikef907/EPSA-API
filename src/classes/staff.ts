import {
  Authorized,
  Field,
  ID,
  InputType,
  InterfaceType,
  ObjectType,
} from 'type-graphql';
import { IUser, IUserInput, UserInput, UserQuery } from './user';

@InterfaceType()
export abstract class IStaffInput {
  @Field((_type) => ID)
  id!: number;
  @Field()
  userId!: number;
  @Field({ nullable: true })
  start?: Date;
  @Field({ nullable: true })
  description?: string;
  @Field((_type) => IUserInput)
  user!: IUser;
}

@InterfaceType({ implements: IStaffInput })
export abstract class IStaff extends IStaffInput {
  @Field({ nullable: true })
  img?: string;
  @Field((_type) => UserQuery)
  user!: IUser;
  @Field()
  created_at?: Date;
  @Field()
  updated_at?: Date;
}

@ObjectType({ implements: [IStaff, IStaffInput] })
export class StaffQuery {}

@InputType()
export class StaffInput extends IStaffInput {
  @Field((_type) => ID, { nullable: true })
  id!: number;
  @Field()
  userId!: number;
  @Field({ nullable: true })
  start?: Date;
  @Field({ nullable: true })
  description?: string;
  @Field((_type) => UserInput)
  user!: IUser;
}

@InputType()
export class StaffUpdate extends IStaffInput {
  @Authorized(['Admin'])
  @Field({ nullable: true })
  start?: Date;
  @Field((_type) => ID)
  id!: number;
  @Field()
  userId!: number;
  @Field({ nullable: true })
  description?: string;
  @Field((_type) => UserInput)
  user!: IUser;
}
