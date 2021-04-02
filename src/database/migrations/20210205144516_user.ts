import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.timestamps(true, true);
    table.string('first_name');
    table.string('last_name');
    table.string('email');
    table.unique(['email']);
    table.string('password');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
