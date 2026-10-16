import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const config = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD,
};
const DB_NAME = process.env.DB_NAME ?? 'plant_tracker';


export const pool = mysql.createPool({
  ...config,
  database: DB_NAME,
  dateStrings: true,
  namedPlaceholders: true,
});


export async function initDatabase() {
  const connection = await mysql.createConnection(config);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4`);
  await connection.end();

  const schema = await readFile(path.join(import.meta.dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
}


export function explainDbError(err) {
  const hints = {
    ECONNREFUSED: 'MySQL is not running. Open "Services" from the Start menu and start the MySQL service.',
    ER_ACCESS_DENIED_ERROR: 'Wrong DB_USER or DB_PASSWORD in backend/.env',
    ER_DBACCESS_DENIED_ERROR: 'This MySQL user may not create the database. Use root in backend/.env',
  };
  const hint = hints[err.code];
  return hint ? `${err.message || err.code}\nHint: ${hint}` : err.message;
}
