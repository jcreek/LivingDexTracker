import { writable } from 'svelte/store';
import { type User } from '@supabase/auth-js';

// Create a user store with null as the initial value
export const user = writable<User | null>(null);
