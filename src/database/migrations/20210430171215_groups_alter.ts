import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('user_group').del();

  await knex('groups').del();

  return knex.schema.table('groups', function (table) {
    table.string('description');
    table.string('title').notNullable();
    table.date('start').notNullable();
    table.date('end').notNullable();
    table.integer('limit').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('groups', function (table) {
    table.dropColumns('description', 'title', 'start', 'end', 'limit');
  });
}
