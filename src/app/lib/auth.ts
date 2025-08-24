import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { username } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  database: new Pool({
    connectionString: parseInt(process.env.USE_LOCAL)
      ? process.env.CONNECTION_STRING_LOCAL
      : process.env.CONNECTION_STRING,
  }),
  plugins: [username(), nextCookies()],
  emailAndPassword: {
    enabled: true,
  },
});
