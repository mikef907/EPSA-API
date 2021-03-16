import dayjs from 'dayjs';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Event, EventInput, EventQuery } from '../../classes/event';
import { knex } from '../../database/connection';

@Resolver((_of) => Event)
export class EventResolver {
  @Query((_returns) => [EventQuery])
  async events() {
    return await knex<Event>('events').select<Event>('*');
  }

  @Mutation((_of) => EventQuery)
  async addEvent(@Arg('event') event: EventInput) {
    if (!dayjs(event.end).isValid()) delete event.end;

    const result = await knex<Event>('events')
      .returning('*')
      .insert<Event[]>(event);

    return result[0];
  }

  @Mutation((_of) => EventQuery)
  async updateEvent(@Arg('event') event: EventInput) {
    if (!dayjs(event.end).isValid()) delete event.end;

    const result = await knex<Event>('events')
      .returning('*')
      .where({ id: event.id })
      .update<Event[]>(event);

    return result[0];
  }

  @Query((_returns) => EventQuery)
  async event(@Arg('id') id: number) {
    return await knex<Event>('events').select<Event>('*').where({ id }).first();
  }
}
