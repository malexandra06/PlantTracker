// npm run db:reset  ->  deletes all plants and puts the sample plants back.
import { explainDbError, initDatabase, pool } from './database.js';
import { seed } from './seed.js';

try {
  await initDatabase();
  console.log(`Database reset: ${await seed({ reset: true })} sample plants inserted.`);
} catch (err) {
  console.error(explainDbError(err));
  process.exitCode = 1;
} finally {
  await pool.end();
}
