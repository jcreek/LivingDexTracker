/** Shared scheduling boundary for optional page-start work. Explicit refreshes bypass it. */
const READY_EVENT = 'livingdex:grid-interactive';
export function markGridInteractive() {
	if (typeof window === 'undefined') return;
	if (!document.querySelector('[data-entry-index]')) return;
	if (!document.querySelector('[data-grid-interactive]')) {
		performance.mark('pokedex:first-interactive');
	}
	document
		.querySelector('[data-entry-index]')
		?.closest('.boxes-grid')
		?.setAttribute('data-grid-interactive', 'true');
	window.dispatchEvent(new Event(READY_EVENT));
}

export function afterCriticalPageWork(run: () => void): () => void {
	let cancelled = false;
	let scheduled = false;
	let idle: number | undefined;
	let frame: number | undefined;
	const perform = () => {
		if (cancelled) return;
		cancel();
		run();
	};
	const schedule = () => {
		if (scheduled || cancelled) return;
		scheduled = true;
		frame = requestAnimationFrame(() => {
			if ('requestIdleCallback' in window)
				idle = window.requestIdleCallback(perform, { timeout: 5000 });
			else frame = requestAnimationFrame(perform);
		});
	};
	const fallback = window.setTimeout(perform, 5000);
	const cancel = () => {
		cancelled = true;
		window.clearTimeout(fallback);
		window.removeEventListener(READY_EVENT, schedule);
		if (idle !== undefined) window.cancelIdleCallback(idle);
		if (frame !== undefined) cancelAnimationFrame(frame);
	};
	window.addEventListener(READY_EVENT, schedule);
	if (
		!location.pathname.startsWith('/pokedex/') ||
		document.querySelector('[data-grid-interactive]')
	)
		schedule();
	return cancel;
}
