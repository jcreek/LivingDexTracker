import process from 'node:process';
import AdapterNode from '@sveltejs/adapter-node';
import AdapterNetlify from '@sveltejs/adapter-netlify';

export const nodeAdapter =
	process.env.NODE_ADAPTER === 'true' || process.env.DEPLOY_TARGET === 'node';
export const cloudflareAdapter = process.env.DEPLOY_TARGET === 'cloudflare';
export const adapter = nodeAdapter
	? AdapterNode({ precompress: true })
	: cloudflareAdapter
		? (await import('@sveltejs/adapter-cloudflare')).default()
		: AdapterNetlify({ edge: false, split: false });
