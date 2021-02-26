import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.schema.createTable('roles', (table) => {
    table.increments();
    table.timestamps(true, true);
    table.integer('userId');
    table.foreign('userId').references('users.id');
    table.string('name');
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTable('roles');
}
