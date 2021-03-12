import { Authorized, Field, ID, InputType, ObjectType } from 'type-graphql';
import { User, UserInput, UserQuery } from './user';

export class Staff {
  id!: number;
  userId!: number;
  description?: string;
  start?: Date;
  img?: string;
  created_at?: Date;
  updated_at?: Date;
  user?: User;
}

@ObjectType()
export class StaffQuery implements Partial<Staff> {
  @Field((_type) => ID)
  id!: number;
  @Field()
  userId!: number;
  @Field()
  start!: Date;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true })
  img?: string;
  @Field((_type) => UserQuery)
  user!: User;
}

@InputType()
export class StaffInput implements Partial<User> {
  @Field((_type) => ID)
  id!: number;
  @Field()
  userId!: number;
  @Authorized(['Admin'])
  @Field({ nullable: true })
  start?: Date;
  @Field({ nullable: true })
  description?: string;
  @Field((_type) => UserInput)
  user!: User;
}
