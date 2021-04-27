import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_group', (table) => {
    table.integer('userId').notNullable().references('users.id');
    table.integer('groupId').notNullable().references('groups.id');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_group');
}
