import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('events', (table) => {
    table.increments();
    table.timestamps(true, true);
    table.integer('parentId').nullable();
    table.foreign('parentId').references('events.id');
    table.string('name');
    table.string('description');
    table.boolean('allDay');
    table.dateTime('start');
    table.dateTime('end');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('events');
}
