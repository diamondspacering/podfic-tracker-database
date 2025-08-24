'use client';

import { useState, useEffect, useRef } from 'react';

export const usePersistentState = <T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    let storedValue = null;
    if (typeof window !== 'undefined') {
      storedValue = window?.localStorage?.getItem(key);
    }
    return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined')
      window?.localStorage?.setItem(key, JSON.stringify(state));
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
