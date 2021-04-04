import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('posts', (table) => {
    table.increments();
    table.timestamps(true, true);
    table.integer('authorId').references('users.id');
    table.dateTime('published');
    table.string('headline');
    table.string('imgUrl');
    table.text('content');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('posts');
}
