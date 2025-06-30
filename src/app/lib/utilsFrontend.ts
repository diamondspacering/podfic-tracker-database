'use client';

import { useState, useEffect, useRef } from 'react';

// TODO: this complains about localStorage not being defined, but it does still work

export const usePersistentState = <T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    // const storedValue =
    //   typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const storedValue = localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
  });

  useEffect(() => {
    // if (typeof window !== 'undefined')
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};
export const useDebouncedCallback = (callback, wait = 500) => {
  const argsRef = useRef<any>();
  const timeoutRef = useRef<any>();

  function cleanup() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => cleanup, []);

  return function debouncedCallback(...args) {
    argsRef.current = args;
    cleanup();

    timeoutRef.current = setTimeout(() => {
      if (argsRef.current) {
        callback(...argsRef.current);
      }
    }, wait);
  };
};
