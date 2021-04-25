import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('groups', function (table) {
    table.increments();
    table.timestamps(true, true);
    table.integer('facilitatorId').references('users.id');
    table.integer('zipCode');
    table.string('language');
    table.string('city');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('groups');
}
