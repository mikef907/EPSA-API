import * as Knex from 'knex';
import { User } from '../../classes/user';
import argon2 from 'argon2';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex<User>('users').insert([
    {
      first_name: 'Michael',
      last_name: 'Fullom',
      email: 'mikef907@gmail.com',
      password: await argon2.hash('password'),
    },
    {
      first_name: 'Amanda',
      last_name: 'Dale',
      email: 'amandabdale@gmail.com',
      password: await argon2.hash('password'),
    },
  ]);
}
