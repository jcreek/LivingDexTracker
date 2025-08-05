import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

export abstract class BaseRepository {
	protected supabase: SupabaseClient<Database>;

	constructor(supabase: SupabaseClient<Database>) {
		this.supabase = supabase;
	}

	protected handleError(error: any): never {
		console.error('Repository error:', error);
		throw new Error(error.message || 'An unexpected error occurred');
	}

	protected toCamelCase(obj: any): any {
		if (obj === null || obj === undefined) return obj;
		if (obj instanceof Date) return obj;
		if (Array.isArray(obj)) return obj.map(item => this.toCamelCase(item));
		if (typeof obj !== 'object') return obj;

		const converted: any = {};
		for (const key in obj) {
			const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
			converted[camelKey] = this.toCamelCase(obj[key]);
		}
		return converted;
	}

	protected toSnakeCase(obj: any): any {
		if (obj === null || obj === undefined) return obj;
		if (obj instanceof Date) return obj;
		if (Array.isArray(obj)) return obj.map(item => this.toSnakeCase(item));
		if (typeof obj !== 'object') return obj;

		const converted: any = {};
		for (const key in obj) {
			const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
			converted[snakeKey] = this.toSnakeCase(obj[key]);
		}
		return converted;
	}
}