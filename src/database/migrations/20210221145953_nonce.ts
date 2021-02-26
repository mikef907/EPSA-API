import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('nonces', (table) => {
    table.increments();
    table.timestamps(true, true);
    table.uuid('nonce');
    table.integer('userId');
    table.index('nonce');
    table.unique(['nonce']);
    table.foreign('userId').references('users.id');
    table.boolean('used').defaultTo(false);
    table.dateTime('expiry');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('nonces');
}
