import { IsLive } from '../config';
import { knex } from './connection';

const initDB = async () => {
  if (!IsLive) {
    await knex.migrate.latest().then(
      () => {
        console.log('Migrations Completed!');
        knex.seed.run().then(
          () => console.log('Seeding Completed!'),
          (err) => console.error(err)
        );
      },
      (err: any) => console.error(err)
    );
  }
};

export default initDB;
