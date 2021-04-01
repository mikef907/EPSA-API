import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.schema.createTable('posts', (table) => {
    table.increments();
    table.timestamps(true, true);
    table.integer('author').unique().references('users.id');
    table.dateTime('published');
    table.string('headline');
    table.string('imgUrl');
    table.string('content');
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTable('posts');
}
