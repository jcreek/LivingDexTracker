#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const [, , command, ...args] = process.argv;
if (!command) {
	console.error('Usage: node scripts/run-with-local-supabase.mjs <command> [...args]');
	process.exit(2);
}

const SETUP_HINT = 'Run "npm run supabase:start" followed by "npm run supabase:reset".';
// npx is a shell script on Windows, where spawn needs a shell to find it.
const useShell = process.platform === 'win32';

function fail(message, detail) {
	console.error(message);
	if (detail) console.error(String(detail).trim());
	process.exit(1);
}

const status = spawnSync('npx', ['supabase', 'status', '--output', 'json'], {
	encoding: 'utf8',
	stdio: ['ignore', 'pipe', 'pipe'],
	shell: useShell
});

if (status.error) {
	fail(
		'Unable to run "npx supabase status" - is the supabase CLI installed?',
		status.error.message
	);
}

if (status.status !== 0) {
	const stderr = status.stderr ?? '';
	// Distinguish a stopped stack from a genuinely broken CLI invocation, so the hint is only
	// printed when it is actually the advice the reader needs.
	if (/not running|supabase start/i.test(stderr)) {
		fail(`Local Supabase is required but is not running.\n${SETUP_HINT}`, stderr);
	}
	fail(`"supabase status" failed with exit code ${status.status}.`, stderr);
}

let values;
try {
	values = JSON.parse(status.stdout);
} catch (error) {
	fail('Unable to parse "supabase status --output json".', error);
}

const apiUrl = values.API_URL ?? values.api_url ?? 'http://127.0.0.1:54321';
const anonKey = values.ANON_KEY ?? values.PUBLISHABLE_KEY ?? values.anon_key;
const serviceRoleKey = values.SERVICE_ROLE_KEY ?? values.SECRET_KEY ?? values.service_role_key;

if (!anonKey || !serviceRoleKey) {
	fail(`Supabase status did not return an anonymous and service-role key.\n${SETUP_HINT}`);
}

// A running-but-unseeded database is the most common broken state, and it surfaces downstream as
// a confusing assertion failure. Check it here instead.
const probe = await fetch(`${apiUrl}/rest/v1/pokedex_entries?select=id&limit=1`, {
	headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
}).catch((error) => {
	fail(`Unable to reach the local Supabase REST API at ${apiUrl}.\n${SETUP_HINT}`, error);
});

if (!probe.ok) {
	fail(
		`The local Supabase database has no readable pokedex_entries (HTTP ${probe.status}).\n${SETUP_HINT}`,
		await probe.text()
	);
}
if (((await probe.json()) ?? []).length === 0) {
	fail(`The local Supabase database is empty - migrations or seeds have not run.\n${SETUP_HINT}`);
}

const child = spawnSync(command, args, {
	stdio: 'inherit',
	shell: useShell,
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

if (child.error) fail(`Unable to run "${command}".`, child.error.message);
// A signalled child reports status === null; exiting 0 there would hide the failure.
process.exit(child.signal ? 1 : child.status ?? 1);
