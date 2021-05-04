import {
  ArgsType,
  Authorized,
  Field,
  ID,
  InputType,
  Int,
  InterfaceType,
  ObjectType,
} from 'type-graphql';
import { IStaff, StaffQuery } from './staff';
import { IUser, UserQuery } from './user';

@InterfaceType()
export abstract class IGroupInput {
  @Field((_type) => ID)
  id?: number;
  @Field()
  facilitatorId!: number;
  @Field()
  city!: string;
  @Field()
  zipCode!: number;
  @Field()
  language!: string;
  @Field()
  title!: string;
  @Field({ nullable: true })
  description?: string;
  @Field()
  start!: Date;
  @Field()
  end!: Date;
  @Field((_type) => Int)
  limit!: number;
}

@InterfaceType({ implements: IGroupInput })
export abstract class IGroup extends IGroupInput {
  @Field((_type) => StaffQuery, { nullable: true })
  facilitator?: IStaff;
  @Authorized(['Admin', 'Staff'])
  @Field((_type) => [UserQuery], { nullable: true })
  users?: IUser[];
  @Field()
  created_at!: Date;
  @Field()
  updated_at!: Date;
}

@ObjectType({ implements: [IGroup, IGroupInput] })
export class GroupQuery {}

@InputType()
export class GroupInput extends IGroupInput {
  @Field((_type) => ID)
  id?: number;
  @Field()
  facilitatorId!: number;
  @Field()
  city!: string;
  @Field()
  zipCode!: number;
  @Field()
  language!: string;
  @Field()
  title!: string;
  @Field({ nullable: true })
  description?: string;
  @Field()
  start!: Date;
  @Field()
  end!: Date;
  @Field((_type) => Int)
  limit!: number;
}

@ArgsType()
export class GetGroupsArgs {
  @Field((type) => Int, { nullable: true })
  take?: number;
  @Field((type) => Int, { nullable: true })
  zipCode?: number;
  @Field({ nullable: true })
  language?: string;
}
