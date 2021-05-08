import dayjs from 'dayjs';
import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import {
  IEvent,
  EventQuery,
  GetEventsArgs,
  EventInput,
} from '../../classes/event';
import { knex } from '../../database/connection';

@Resolver((_of) => IEvent)
export class EventResolver {
  @Query((_returns) => [EventQuery])
  async events(@Args() { take }: GetEventsArgs) {
    let q = knex<IEvent>('events').select<IEvent>('*').orderBy('start', 'desc');

    if (take) q = q.limit(take);

    return await q;
  }

  @Mutation((_of) => EventQuery)
  async addEvent(@Arg('event') event: EventInput) {
    if (!dayjs(event.end).isValid()) delete event.end;

    const result = await knex<IEvent>('events')
      .returning('*')
      .insert<IEvent[]>(event);

    return result[0];
  }

  @Mutation((_of) => EventQuery)
  async updateEvent(@Arg('event') event: EventInput) {
    if (!dayjs(event.end).isValid()) delete event.end;

    const result = await knex<IEvent>('events')
      .returning('*')
      .where({ id: event.id })
      .update<IEvent[]>(event);

    return result[0];
  }

  @Query((_returns) => EventQuery)
  async event(@Arg('id') id: number) {
    return await knex<IEvent>('events')
      .select<IEvent>('*')
      .where({ id })
      .first();
  }
}
