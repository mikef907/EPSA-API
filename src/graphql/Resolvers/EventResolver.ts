import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import { Event, EventInput, EventQuery } from '../../classes/event';
import { knex } from '../../database/connection';

@Resolver((_of) => Event)
export class EventResolver {
  @Query((_returns) => EventQuery)
  async events() {
    return knex
      .join('events', 'events.id', '=', 'events.parentId')
      .select<Event>()
      .from('events');
  }

  @Mutation((_of) => EventQuery)
  async addEvent(@Arg('event') event: EventInput) {
    return await knex<Event>('events').returning('*').insert<Event>(event);
  }
}
