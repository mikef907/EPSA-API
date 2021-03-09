import { Field, ID, ObjectType } from 'type-graphql';
import { User, UserQuery } from './user';

export class Staff {
  id!: number;
  userId!: number;
  description?: string;
  start!: Date;
  img?: string;
  created_at?: Date;
  updated_at?: Date;
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
}
