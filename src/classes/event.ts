import {
  ArgsType,
  Field,
  ID,
  InputType,
  Int,
  InterfaceType,
  ObjectType,
} from 'type-graphql';

@InterfaceType()
export abstract class IEventInput {
  @Field((type) => ID)
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

@InterfaceType({ implements: IEventInput })
export abstract class IEvent extends IEventInput {
  @Field()
  created_at!: Date;
  @Field()
  updated_at!: Date;
}

@ObjectType({ implements: [IEvent, IEventInput] })
export class EventQuery {}

@InputType()
export class EventInput extends IEventInput {
  @Field((type) => ID, { nullable: true })
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
