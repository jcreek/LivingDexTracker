const META_CACHE = 'livingdex-offline-meta-v1';
const META_URL = '/__offline/current';

function element(tag, className, text) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

function statusText(record) {
	if (!record) return 'Not caught';
	const values = [];
	if (record.caught) values.push('Caught');
	if (record.haveToEvolve) values.push('Needs evolution');
	if (record.inHome) values.push('In HOME');
	return values.join(' · ') || 'Not caught';
}

function renderSnapshot(snapshot) {
	const content = document.querySelector('#offline-content');
	for (const { pokedex, entries } of snapshot.pokedexes) {
		const section = element('section', 'card bg-base-100 mb-6 shadow');
		const body = element('div', 'card-body');
		body.append(element('h2', 'card-title text-2xl', pokedex.name));
		body.append(element('p', 'text-sm opacity-70', `${entries.length} entries`));
		const grid = element(
			'div',
			'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6'
		);
		for (const { pokedexEntry: entry, catchRecord } of entries) {
			const card = element('article', 'rounded border border-base-300 p-2');
			const image = element('img', 'mx-auto h-20 w-20 object-contain');
			image.alt = `${entry.pokemon}${entry.form ? ` — ${entry.form}` : ''}`;
			image.src = entry.offlineSpriteUrl ?? '/placeholder-bulb.png';
			image.addEventListener(
				'error',
				() => {
					image.src = '/placeholder-bulb.png';
				},
				{ once: true }
			);
			card.append(image);
			card.append(element('h3', 'font-semibold', `#${entry.pokedexNumber} ${entry.pokemon}`));
			if (entry.form) card.append(element('p', 'text-xs opacity-70', entry.form));
			card.append(element('p', 'text-sm', statusText(catchRecord)));
			if (catchRecord?.personalNotes)
				card.append(element('p', 'mt-1 whitespace-pre-wrap text-xs', catchRecord.personalNotes));
			grid.append(card);
		}
		body.append(grid);
		section.append(body);
		content.append(section);
	}
}

async function load() {
	const status = document.querySelector('#offline-status');
	try {
		const meta = await (await (await caches.open(META_CACHE)).match(META_URL))?.json();
		if (!meta?.userId) throw new Error('No collection has been synchronized on this device.');
		if (!meta.dataCache) throw new Error('The saved collection metadata is incomplete.');
		const dataCache = await caches.open(meta.dataCache);
		const response = await dataCache.match(
			`/__offline/snapshot/${encodeURIComponent(meta.userId)}`
		);
		if (!response)
			throw new Error('The saved collection is incomplete. Reconnect and synchronize again.');
		const snapshot = await response.json();
		if (snapshot.version !== 1 || snapshot.userId !== meta.userId)
			throw new Error('The saved collection is incompatible with this app version.');
		status.textContent = `Saved ${new Date(snapshot.generatedAt).toLocaleString()}.`;
		renderSnapshot(snapshot);
	} catch (error) {
		status.className = 'alert alert-warning';
		status.textContent = error instanceof Error ? error.message : String(error);
	}
}

void load();

navigator.serviceWorker?.addEventListener('message', (event) => {
	if (event.data?.type !== 'OFFLINE_DATA_CLEARED') return;
	const content = document.querySelector('#offline-content');
	if (content) content.replaceChildren();
	const status = document.querySelector('#offline-status');
	if (status) {
		status.className = 'alert alert-warning';
		status.textContent =
			'The saved collection was removed because the account changed or signed out.';
	}
});
