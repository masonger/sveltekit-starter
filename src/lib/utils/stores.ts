import { writable } from 'svelte/store';

import { browser } from '$app/environment';

import type { Maybe, Json } from '$types/core';
import type { Writable } from 'svelte/store';

const memoryStore = <T extends Json<T>>(initial?: T): Writable<T> => writable(initial);

const localStore = <T extends Json<T>>(key: string, initial?: T): Writable<T> => {
  if (!browser) {
    return memoryStore(initial);
  }

  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify(initial));
  }

  const data = <T>JSON.parse(localStorage.getItem(key) ?? '{}');
  const { subscribe, set, update } = memoryStore(data);

  const storeLocally = (value: T): void => localStorage.setItem(key, JSON.stringify(value));

  return {
    subscribe,
    set: (value): void => {
      set(value);
      storeLocally(value);
    },
    update: (updater): void => {
      let value: Maybe<T>;

      update((val) => {
        value = updater(val);

        return value;
      });

      if (value !== undefined) {
        storeLocally(value);
      } else if (initial !== undefined) {
        storeLocally(initial);
      }
    },
  };
};

export const counterMemoryStore = memoryStore<number>(0);
export const counterLocalStore = localStore<number>('counter', 0);
