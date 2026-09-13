#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const [, , command, ...args] = process.argv;
if (!command) {
	console.error('Usage: node scripts/run-with-local-supabase.mjs <command> [...args]');
	process.exit(2);
}

const status = spawnSync('npx', ['supabase', 'status', '--output', 'json'], {
	encoding: 'utf8',
	stdio: ['ignore', 'pipe', 'pipe']
});

if (status.status !== 0) {
	console.error('Local Supabase is required but is not running.');
	console.error('Run "npm run supabase:start" followed by "npm run supabase:reset".');
	if (status.stderr.trim()) console.error(status.stderr.trim());
	process.exit(status.status ?? 1);
}

let values;
try {
	values = JSON.parse(status.stdout);
} catch (error) {
	console.error('Unable to parse "supabase status --output json".');
	console.error(error);
	process.exit(1);
}

const apiUrl = values.API_URL ?? values.api_url ?? 'http://127.0.0.1:54321';
const anonKey = values.ANON_KEY ?? values.PUBLISHABLE_KEY ?? values.anon_key;
const serviceRoleKey = values.SERVICE_ROLE_KEY ?? values.SECRET_KEY ?? values.service_role_key;

if (!anonKey || !serviceRoleKey) {
	console.error('Supabase status did not return an anonymous and service-role key.');
	process.exit(1);
}

const child = spawnSync(command, args, {
	stdio: 'inherit',
	env: {
		...process.env,
		PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ?? apiUrl,
		PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ?? anonKey,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? serviceRoleKey,
		TEST_SUPABASE_URL: process.env.TEST_SUPABASE_URL ?? apiUrl,
		TEST_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY ?? anonKey,
		E2E_SERVICE_ROLE_KEY: process.env.E2E_SERVICE_ROLE_KEY ?? serviceRoleKey
	}
});

process.exit(child.status ?? 1);
