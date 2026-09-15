import { readFile } from 'node:fs/promises';
const data = JSON.parse(await readFile(process.argv[2], 'utf8'));
const warm = data.results.filter((row) => row.run === 'warm');
const p75 = (values) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * 0.75) - 1];
const groups = [...new Set(warm.map((row) => `${row.fixture}/${row.navigation}`))];
const paired = groups.map((group) => {
	const rows = (host) =>
		warm.filter((row) => `${row.fixture}/${row.navigation}` === group && row.host === host);
	for (const host of ['netlify', 'cloudflare'])
		if (rows(host).length < 30) throw new Error(`Insufficient ${host} warm samples for ${group}`);
	return {
		group,
		netlify: p75(rows('netlify').map((row) => row.interactiveMs)),
		cloudflare: p75(rows('cloudflare').map((row) => row.interactiveMs))
	};
});
if (groups.length !== 4)
	throw new Error(
		'Expected national and scoped-form fixtures, each with direct and client navigation'
	);
const netlify = p75(warm.filter((row) => row.host === 'netlify').map((row) => row.interactiveMs));
const cloudflare = p75(
	warm.filter((row) => row.host === 'cloudflare').map((row) => row.interactiveMs)
);
const improvement = netlify - cloudflare;
const passes =
	improvement >= 200 &&
	improvement / netlify >= 0.2 &&
	paired.every((row) => row.cloudflare <= row.netlify * 1.1);
console.log(
	JSON.stringify(
		{
			overallP75: { netlify, cloudflare },
			improvementMs: improvement,
			improvementPercent: (100 * improvement) / netlify,
			groups: paired,
			performanceGatePassed: passes,
			recommendation:
				passes && data.compatibilityPassed && data.environment === 'deployed'
					? 'Cloudflare qualifies for a migration proposal; review operating cost before cutover.'
					: 'Retain Netlify: performance, deployed evidence or compatibility gate is unmet.'
		},
		null,
		2
	)
);
