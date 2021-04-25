import {
  ArgsType,
  Authorized,
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from 'type-graphql';
import { Staff, StaffQuery } from './staff';
import { User, UserQuery } from './user';

export class Group {
  id!: number;
  facilitatorId!: number;
  facilitator?: Staff;
  users?: User[];
  city!: string;
  zipCode!: number;
  language!: string;
  created_at!: Date;
  updated_at!: Date;
}

@ObjectType()
export class GroupQuery implements Partial<Group> {
  @Field((_type) => ID)
  id!: number;
  @Field()
  facilitatorId!: number;
  @Field((_type) => StaffQuery, { nullable: true })
  facilitator?: Staff;
  @Authorized(['Admin', 'Staff'])
  @Field((_type) => [UserQuery], { nullable: true })
  users?: User[];
  @Field()
  city!: string;
  @Field()
  zipCode!: number;
  @Field()
  language!: string;
  @Field()
  created_at!: Date;
  @Field()
  updated_at!: Date;
}

@InputType()
export class GroupInput implements Partial<Group> {
  @Field()
  facilitatorId!: number;
  @Field()
  city!: string;
  @Field()
  zipCode!: number;
  @Field()
  language!: string;
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
