import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_role', (table) => {
    table.integer('userId').notNullable().references('users.id');
    table.integer('roleId').notNullable().references('roles.id');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_role');
}
