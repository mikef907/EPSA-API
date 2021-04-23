import { ArgsType, Field, ID, InputType, Int, ObjectType } from 'type-graphql';

export class Event {
  id!: number;
  parentId?: number;
  name!: string;
  description!: string;
  allDay!: boolean;
  start!: Date;
  end?: Date | null;
  zipCode!: number;
  language!: string;
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
  zipCode!: number;
  @Field()
  language!: string;
  @Field()
  created_at!: Date;
  @Field()
  updated_at!: Date;
}

@InputType()
export class EventInput implements Partial<Event> {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  parentId?: number;
  @Field()
  name!: string;
  @Field()
  description?: string;
  @Field({ nullable: true })
  allDay?: boolean;
  @Field()
  start!: Date;
  @Field({ nullable: true })
  end?: Date;
  @Field()
  zipCode!: number;
  @Field()
  language!: string;
}

@ArgsType()
export class GetEventsArgs {
  @Field((type) => Int, { nullable: true })
  take?: number;
}
