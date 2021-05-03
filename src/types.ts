import { IUser } from './classes/user';

declare module 'knex/types/tables' {
  interface Tables {
    users: IUser;
  }
}
