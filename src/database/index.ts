// declare module 'knex/types/tables' {
//     interface User {
//         id: number;
//         firstname: string;
//         lastname: string;
//         email: string;
//         password: string;
//         created_at: Date;
//         updated_at: Date;
//     },
//     interface Tables {
//         users: User;
//     }
// }

import Knex from "knex";

const initDB = async() => {

const environments = require('./knexfile');

const config = environments.development;

const knex = Knex(config);

await knex.schema.hasTable('users').then(result => {
  if(!result) {
    knex.schema.createTable('users', table => {
      table.increments('id');
      table.string('firstname');
    }).then(() => {
      console.log('Users Table Created!')
    })
  }
})

await knex('users').where('firstname', 'Mike').then(async result => {
    if(!result)
    {
        await knex('users').insert({ firstname: 'Mike' }).then(result => {
          console.log(result)
        });
    }
})

await knex('users').select().then(users => {
  console.log(users);
});

}

export default initDB;