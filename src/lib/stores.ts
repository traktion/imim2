import { writable } from 'svelte/store';

export const activeAddress = writable<string | undefined>(undefined);
