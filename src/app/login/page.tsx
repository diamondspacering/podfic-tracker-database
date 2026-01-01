'use client';

import { useCallback, useState } from 'react';
import styles from '@/app/dashboard/dashboard.module.css';
import { Button, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  signUp as signUpLoader,
  signIn as signInLoader,
} from '../lib/authLoaders';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default function Page({ searchParams }) {
  const returnUrl = searchParams.return_url;

  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInLoader(
        {
          username,
          password,
          callbackURL: returnUrl,
        },
        returnUrl
      );
    } catch (e) {
      console.error('Error signing in:', e);
    } finally {
      setIsLoading(false);
    }
  }, [password, returnUrl, username]);

  const signUp = useCallback(async () => {
    setIsLoading(true);
    try {
      await signUpLoader(
        {
          email,
          name: username,
          username,
          password,
          callbackURL: returnUrl,
        },
        returnUrl
      );
    } catch (e) {
      console.error('Error signing up', e);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, returnUrl, username]);

  return (
    <div className={styles.body}>
      <div
        className={styles.flexColumn}
        style={{
          width: '50%',
        }}
      >
        {isNewUser ? (
          <>
            <Typography variant='h5'>
              Create credentials for podfic tracker database
            </Typography>
            <TextField
              size='small'
              type='email'
              label='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              size='small'
              type='email'
              label='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              size='small'
              type='password'
              label='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <LoadingButton
              variant='contained'
              loading={isLoading}
              onClick={signUp}
            >
              Create credentials
            </LoadingButton>
            <Button variant='outlined' onClick={() => setIsNewUser(false)}>
              Sign in instead
            </Button>
          </>
        ) : (
          <>
            <Typography variant='h5'>
              Sign in to podfic tracker database
            </Typography>
            <TextField
              size='small'
              type='email'
              label='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              size='small'
              type='password'
              label='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <LoadingButton
              variant='contained'
              loading={isLoading}
              onClick={signIn}
            >
              Sign in
            </LoadingButton>
            {/* TODO: disable after 1st user */}
            <Button variant='outlined' onClick={() => setIsNewUser(true)}>
              Sign up instead
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
