import * as Knex from 'knex';
import { User } from '../../classes/user';
import argon2 from 'argon2';
import { Role } from '../../classes/role';
import { Event } from '../../classes/event';
import { Staff } from '../../classes/staff';
import dayjs, { Dayjs } from 'dayjs';
import { Post } from '../../classes/post';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user_role').del();

  await knex('staff').del();

  await knex('users').del();

  await knex('roles').del();

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

  await knex<Staff>('staff').insert([
    {
      userId: users[1].id,
      start: dayjs('1-1-2021').toDate(),
    },
  ]);

  await knex<Event>('events').insert([
    {
      name: 'Test',
      description: 'Testing',
      language: 'EN',
      zipCode: 99503,
      start: dayjs().subtract(1, 'day').toDate(),
    },
    {
      name: 'Test2',
      description: 'Testing2',
      language: 'EN',
      zipCode: 99503,
      start: dayjs().add(1, 'day').toDate(),
      end: dayjs().add(1, 'day').add(2, 'hour').toDate(),
    },
    {
      name: 'Test3',
      description: 'Testing3',
      language: 'EN',
      zipCode: 99503,
      start: new Date(),
      allDay: true,
    },
  ]);

  await knex<Post>('posts').insert([
    {
      headline: 'Welcome to EPSA!',
      authorId: users[1].id,
      published: new Date(),
      content: '<p>We are coming soon!</p>',
    },
    {
      headline: 'We are coming soon!',
      authorId: users[1].id,
      published: new Date(),
      content: '<p>We are coming soon!</p>',
    },
    {
      headline: 'This is not published',
      authorId: users[1].id,
      content: '<p>We are coming soon!</p>',
    },
    {
      headline: 'This is also not published',
      authorId: users[1].id,
      content: '<p>We are coming soon!</p>',
    },
  ]);
}
