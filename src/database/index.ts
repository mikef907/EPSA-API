import { IsLive } from '../config';
import { knex } from './connection';

const initDB = async () => {
  console.log('Init DB');
  if (!IsLive) {
    await knex.migrate.rollback().then(
      () => console.log('Rollback completed!'),
      (err) => console.error('Error during rollback', err)
    );
  }

  console.log('Running latest migrations...');
  await knex.migrate.latest().then(
    () => {
      console.log('Migrations Completed!');
      if (!IsLive) {
        knex.seed.run().then(
          () => console.log('Seeding Completed!'),
          (err) => console.error(err)
        );
      }
    },
    (err: any) => console.error(err)
  );
};

export default initDB;
