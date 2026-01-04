'use server';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { getDBClient } from './db-helpers';
import { headers } from 'next/headers';

export const signUp = async (data, returnUrl) => {
  const client = await getDBClient();
  const userResult = await client.query('SELECT name from user');
  if (userResult.rows.length) return 'Max number of users reached.';

  const response = await auth.api.signUpEmail({
    body: data,
  });
  console.log({ response });
  redirect(returnUrl);
};

export const signIn = async (data, returnUrl) => {
  const response = await auth.api.signInUsername({
    body: data,
  });
  console.log({ response });
  redirect(returnUrl);
};

export const signOut = async () => {
  const response = await auth.api.signOut({
    headers: await headers(),
  });
  console.log({ response });
  redirect('/login');
};
