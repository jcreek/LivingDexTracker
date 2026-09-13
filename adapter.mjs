import process from 'node:process';
import AdapterNode from '@sveltejs/adapter-node';
import AdapterNetlify from '@sveltejs/adapter-netlify';

export const nodeAdapter = process.env.NODE_ADAPTER === 'true';

// Netlify is the deployment target; the node adapter exists so the service worker
// build tests can check the `build/client` layout a Node server produces.
export const adapter = nodeAdapter
	? AdapterNode()
	: AdapterNetlify({
			// if true, will create a Netlify Edge Function rather
			// than using standard Node-based functions
			edge: false,

			// if true, will split your app into multiple functions
			// instead of creating a single one for the entire app.
			// if `edge` is true, this option cannot be used
			split: false
		});
