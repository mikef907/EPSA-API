import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('events', function (table) {
    table.integer('zipCode');
    table.string('language');
  });

  await knex('events').update({ zipCode: 99999 }).where('zipCode', 'is', null);
  await knex('events').update({ language: 'EN' }).where('language', 'is', null);

  await knex.schema.alterTable('events', function (table) {
    table.integer('zipCode').nullable().alter();
    table.string('language').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('events', function (table) {
    table.dropColumn('zipCode');
    table.dropColumn('language');
  });
}
