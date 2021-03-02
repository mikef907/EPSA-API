import { Field, ID, InputType, ObjectType } from 'type-graphql';

export class Event {
  id!: number;
  parentId?: number;
  name!: string;
  description!: string;
  allDay!: boolean;
  start!: Date;
  end?: Date;
  created_at!: Date;
  updated_at!: Date;
}

@ObjectType()
export class EventQuery implements Partial<Event> {
  @Field((_type) => ID)
  id!: number;
  @Field({ nullable: true })
  parentId?: number;
  @Field()
  name!: string;
  @Field()
  description!: string;
  @Field({ nullable: true })
  allDay?: boolean;
  @Field()
  start!: Date;
  @Field({ nullable: true })
  end?: Date;
  @Field()
  created_at!: Date;
  @Field()
  updated_at!: Date;
}

@InputType()
export class EventInput implements Partial<Event> {
  @Field({ nullable: true })
  parentId?: number;
  @Field()
  name!: string;
  @Field()
  description!: string;
  @Field({ nullable: true })
  allDay?: boolean;
  @Field()
  start!: Date;
  @Field({ nullable: true })
  end?: Date;
}