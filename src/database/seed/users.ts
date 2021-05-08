import { Knex } from 'knex';
import { IUser } from '../../classes/user';
import argon2 from 'argon2';
import { IRole } from '../../classes/role';
import { IEvent } from '../../classes/event';
import { IStaff } from '../../classes/staff';
import dayjs, { Dayjs } from 'dayjs';
import { IPost } from '../../classes/post';
import { IGroup } from '../../classes/group';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user_role').del();

  await knex('user_group').del();

  await knex('posts').del();

  await knex('groups').del();

  await knex('staff').del();

  await knex('users').del();

  await knex('roles').del();

  const roles = await knex<IRole>('roles')
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
  const users = await knex<IUser>('users')
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
        email: 'bob@epsa.com',
        password: await argon2.hash('password'),
      },
      {
        first_name: 'Jim',
        last_name: 'Halpert',
        email: 'jim@epsa.com',
        password: await argon2.hash('password'),
      },
      {
        first_name: 'Pam',
        last_name: 'Halpert',
        email: 'pam@epsa.com',
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

  await knex<IStaff>('staff').insert([
    {
      userId: users[1].id,
      start: dayjs('1-1-2021').toDate(),
    },
  ]);

  await knex<IEvent>('events').insert([
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

  await knex<IPost>('posts').insert([
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

  const groups = await knex<IGroup>('groups')
    .returning('id')
    .insert([
      {
        facilitatorId: users[1].id,
        language: 'en',
        zipCode: 99999,
        city: 'Anchorage',
        limit: 1,
        start: new Date(),
        end: dayjs(new Date()).add(1, 'month').toDate(),
        title: 'Test 1',
      },
      {
        facilitatorId: users[1].id,
        language: 'es',
        zipCode: 99998,
        city: 'Anchorage',
        limit: 5,
        start: new Date(),
        end: dayjs(new Date()).add(1, 'month').toDate(),
        title: 'Test 2',
      },
      {
        facilitatorId: users[1].id,
        language: 'es',
        zipCode: 99998,
        city: 'Anchorage',
        limit: 5,
        start: dayjs(new Date()).subtract(2, 'month').toDate(),
        end: dayjs(new Date()).subtract(1, 'month').toDate(),
        title: 'Test 3',
      },
    ]);

  // await knex('user_group').insert([
  //   {
  //     userId: users[3].id,
  //     groupId: groups[0],
  //   },
  //   {
  //     userId: users[4].id,
  //     groupId: groups[1],
  //   },
  // ]);
}
