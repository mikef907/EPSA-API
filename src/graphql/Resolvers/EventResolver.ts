import dayjs from 'dayjs';
import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import {
  Event,
  EventInput,
  EventQuery,
  GetEventsArgs,
} from '../../classes/event';
import { knex } from '../../database/connection';

@Resolver((_of) => Event)
export class EventResolver {
  @Query((_returns) => [EventQuery])
  async events(@Args() { take }: GetEventsArgs) {
    let q = knex<Event>('events').select<Event>('*').orderBy('start', 'desc');

    if (take) q = q.limit(take);

    return await q;
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
