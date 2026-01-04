import { Pool } from 'pg';

const pool = new Pool({
  connectionString: parseInt(process.env.USE_LOCAL)
    ? process.env.CONNECTION_STRING_LOCAL
    : process.env.CONNECTION_STRING,
});

export const getDBClient = async () => {
  return pool;
};
