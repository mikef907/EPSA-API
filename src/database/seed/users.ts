import * as Knex from 'knex';
import { User } from '../../classes/user';
import argon2 from 'argon2';
import { Role } from '../../classes/role';
import { Event } from '../../classes/event';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  await knex('roles').del();

  await knex('user_role').del();

  const roles = await knex<Role>('roles')
    .insert([
      {
        name: 'User',
      },
      {
        name: 'Staff',
      },
      {
        name: 'Admin',
      },
    ])
    .returning('*');

  // Inserts seed entries
  const users = await knex<User>('users')
    .insert([
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
      {
        first_name: 'Bob',
        last_name: 'Vance',
        email: 'bob@gmail.com',
        password: await argon2.hash('password'),
      },
    ])
    .returning('*');

  await knex('user_role').insert([
    {
      userId: users[0].id,
      roleId: roles[0].id,
    },
    {
      userId: users[0].id,
      roleId: roles[1].id,
    },
    {
      userId: users[0].id,
      roleId: roles[2].id,
    },
    {
      userId: users[1].id,
      roleId: roles[0].id,
    },
    {
      userId: users[1].id,
      roleId: roles[1].id,
    },
    {
      userId: users[2].id,
      roleId: roles[0].id,
    },
  ]);

  await knex<Event>('events').insert([
    {
      name: 'Test',
      description: 'Testing',
      start: new Date(),
    },
    {
      name: 'Test2',
      description: 'Testing2',
      start: new Date(),
      end: new Date(),
    },
    {
      name: 'Test3',
      description: 'Testing3',
      start: new Date(),
      allDay: true,
    },
  ]);
}
