import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('events', function (table) {
    table.string('address');
    table.string('city');
  });

  await knex('events')
    .update({ address: 'Anchorage' })
    .where('address', 'is', null);
  await knex('events').update({ city: 'Anchorage' }).where('city', 'is', null);

  await knex.schema.alterTable('events', function (table) {
    table.string('address').nullable().alter();
    table.string('city').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('events', function (table) {
    table.dropColumn('address');
    table.dropColumn('city');
  });
}
