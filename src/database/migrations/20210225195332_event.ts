import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.schema.createTable('events', (table) => {
    table.increments();
    table.timestamps(true, true);
    table.integer('parentId');
    table.foreign('parentId').references('events.id').nullable();
    table.string('name');
    table.string('description');
    table.boolean('allDay');
    table.dateTime('start');
    table.dateTime('end');
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.dropSchema('events');
}
