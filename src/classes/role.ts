import { Field, ID, InterfaceType, ObjectType } from 'type-graphql';

@InterfaceType()
export abstract class IRole {
  @Field((_type) => ID)
  id!: number;
  @Field()
  name!: string;
  created_at?: Date;
  updated_at?: Date;
}

@ObjectType({ implements: IRole })
export class RoleQuery {}
