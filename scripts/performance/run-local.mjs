import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const directory = await mkdtemp(path.join(os.tmpdir(), 'livingdex-grid-tests-'));
const port = process.env.PERF_PORT ?? '4185';
const env = {
	...process.env,
	NODE_ADAPTER: 'true',
	PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER: 'true',
	POKEDEX_PERFORMANCE: 'true',
	PERF_FIXTURE_DIR: directory,
	PERF_BASE_URL: `http://127.0.0.1:${port}`,
	PORT: port,
	HOST: '127.0.0.1'
};
function run(command, args) {
	return new Promise((resolve, reject) => {
		const process = spawn(command, args, { env, stdio: 'inherit' });
		process.once('error', reject);
		process.once('exit', (code) =>
			code === 0 ? resolve() : reject(new Error(`${command} failed (${code})`))
		);
	});
}
let server;
let fixture = false;
try {
	await run('npm', ['run', 'build-inject-manifest-node']);
	fixture = true;
	await run('node', ['scripts/performance/fixture.mjs']);
	server = spawn('node', ['build'], { env, stdio: 'inherit' });
	await new Promise((resolve, reject) => {
		const timer = setInterval(async () => {
			try {
				if ((await fetch(env.PERF_BASE_URL)).ok) {
					clearInterval(timer);
					clearTimeout(timeout);
					resolve();
				}
			} catch {}
		}, 200);
		const timeout = setTimeout(() => {
			clearInterval(timer);
			reject(new Error('Local production server did not start'));
		}, 15000);
		server.once('error', (error) => {
			clearInterval(timer);
			clearTimeout(timeout);
			reject(error);
		});
		server.once('exit', (code) => {
			clearInterval(timer);
			clearTimeout(timeout);
			reject(new Error(`Local server exited (${code})`));
		});
	});
	if (process.env.PERF_BENCHMARK === 'true') {
		const data = JSON.parse(await readFile(path.join(directory, 'fixture.json'), 'utf8'));
		await writeFile(
			path.join(directory, 'benchmark-config.json'),
			JSON.stringify({
				samples: 30,
				revision: process.env.PERF_REVISION ?? 'local-working-tree',
				databaseLabel: 'local-seeded-supabase',
				clientLocation: 'local-loopback',
				environment: 'local-node',
				hosts: [
					{
						label: 'node',
						url: env.PERF_BASE_URL,
						storageState: path.join(directory, 'storage-state.json'),
						fixtures: data.dexes.map((dex) => ({
							id: dex.id,
							name: dex.name,
							label: dex.gameScope ? 'scoped-forms' : 'national'
						}))
					}
				]
			})
		);
		await run('node', [
			'scripts/performance/benchmark.mjs',
			path.join(directory, 'benchmark-config.json'),
			path.join(directory, 'benchmark.json')
		]);
		await mkdir('test-results/performance', { recursive: true });
		await cp(path.join(directory, 'benchmark.json'), 'test-results/performance/benchmark.json');
	}
	await run('node', ['scripts/performance/verify.mjs']);
	await run('node', ['scripts/performance/verify-behavior.mjs']);
	await mkdir('test-results/performance', { recursive: true });
	for (const file of ['verification.json', 'behavior.json', 'national.png', 'scoped.png'])
		await cp(path.join(directory, file), path.join('test-results/performance', file));
} finally {
	server?.kill('SIGTERM');
	if (fixture)
		await run('node', ['scripts/performance/fixture.mjs', '--cleanup']).catch((error) => {
			throw new Error(`Fixture cleanup failed; retained recovery files in ${directory}`, {
				cause: error
			});
		});
	await rm(directory, { recursive: true, force: true });
}
