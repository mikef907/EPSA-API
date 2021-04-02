import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('staff', (table) => {
    table.increments();
    table.integer('userId').references('users.id').notNullable();
    table.date('start').notNullable();
    table.string('description');
    table.string('img');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('staff');
}
