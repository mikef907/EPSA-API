import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('user_group').del();

  await knex.schema.alterTable('user_group', function (table) {
    table.primary(['userId', 'groupId']);
  });

  await knex.schema.alterTable('user_role', function (table) {
    table.primary(['userId', 'roleId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex('user_group').del();

  await knex.schema.alterTable('user_group', function (table) {
    table.dropPrimary();
  });

  await knex.schema.alterTable('user_role', function (table) {
    table.dropPrimary();
  });
}
