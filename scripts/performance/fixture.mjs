import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const directory = process.env.PERF_FIXTURE_DIR ?? '/tmp/livingdex-grid-performance';
const url = process.env.PUBLIC_SUPABASE_URL;
if (!url || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname))
	throw new Error('Fixtures require the local Supabase wrapper');
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false }
});
const check = ({ data, error }) => {
	if (error) throw error;
	return data;
};
await mkdir(directory, { recursive: true, mode: 0o700 });
const fixturePath = `${directory}/fixture.json`;
if (process.argv.includes('--cleanup')) {
	const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
	const { user } = check(await admin.auth.admin.getUserById(fixture.userId));
	if (user.email !== fixture.email || !user.email.startsWith('grid-performance-'))
		throw new Error('Refusing to remove a non-fixture account');
	check(await admin.auth.admin.deleteUser(fixture.userId));
	await unlink(fixturePath);
	await unlink(`${directory}/storage-state.json`).catch(() => {});
	console.log('Removed disposable performance account and session.');
	process.exit(0);
}
try {
	await readFile(fixturePath);
	throw new Error('An existing fixture needs cleanup first');
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}
const email = `grid-performance-${randomUUID()}@example.test`;
const password = randomUUID() + 'aA1!';
const { user } = check(await admin.auth.admin.createUser({ email, password, email_confirm: true }));
const fixture = { userId: user.id, email, password, dexes: [] };
await writeFile(fixturePath, JSON.stringify(fixture), { mode: 0o600 });
fixture.dexes = check(
	await admin
		.from('pokedexes')
		.insert([
			{ userId: user.id, name: 'Performance National', isLivingDex: true, isFormDex: false },
			{
				userId: user.id,
				name: 'Performance Scarlet Forms',
				isLivingDex: true,
				isFormDex: true,
				gameScope: 'Scarlet'
			}
		])
		.select()
);
const game = fixture.dexes.find((dex) => dex.gameScope);
check(
	await admin.from('pokedex_dex_scopes').insert({ pokedexId: game.id, dexId: 'scarlet-paldea' })
);
const entries = [];
for (let from = 0; ; from += 1000) {
	const page = check(
		await admin
			.from('pokemon')
			.select('id,isDefaultForm')
			.order('id')
			.range(from, from + 999)
	);
	entries.push(...page);
	if (page.length < 1000) break;
}
for (const dex of fixture.dexes) {
	const selected = entries.filter((entry) => dex.isFormDex || entry.isDefaultForm);
	for (let from = 0; from < selected.length; from += 500) {
		check(
			await admin.from('catch_records').insert(
				selected.slice(from, from + 500).map((entry, index) => ({
					userId: user.id,
					pokedexId: dex.id,
					pokemonId: entry.id,
					caught: (from + index) % 3 === 0,
					haveToEvolve: (from + index) % 3 === 1,
					inHome: (from + index) % 7 === 0,
					personalNotes: index === 0 ? 'Performance fixture note: preserve me' : ''
				}))
			)
		);
	}
}
await writeFile(fixturePath, JSON.stringify(fixture), { mode: 0o600 });
const cookies = [];
const client = createServerClient(url, process.env.PUBLIC_SUPABASE_ANON_KEY, {
	cookies: { getAll: () => [], setAll: (values) => cookies.push(...values) }
});
check(await client.auth.signInWithPassword({ email, password }));
const base = new URL(process.env.PERF_BASE_URL ?? 'http://127.0.0.1:4173');
await writeFile(
	`${directory}/storage-state.json`,
	JSON.stringify({
		cookies: cookies.map(({ name, value }) => ({
			name,
			value,
			domain: base.hostname,
			path: '/',
			httpOnly: false,
			secure: base.protocol === 'https:',
			sameSite: 'Lax'
		})),
		origins: []
	}),
	{ mode: 0o600 }
);
console.log('Prepared national and scoped-form fixtures and a private browser session.');
