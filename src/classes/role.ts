import { Field, ID, ObjectType } from 'type-graphql';

export class Role {
  id!: number;
  name!: string;
  created_at?: Date;
  updated_at?: Date;
}

@ObjectType()
export class RoleQuery implements Partial<Role> {
  @Field((_type) => ID)
  id!: number;
  @Field()
  name!: string;
}
