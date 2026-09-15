import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { afterCriticalPageWork, markGridInteractive } from '$lib/utils/criticalPageWork';

describe('optional work scheduling', () => {
	let events: EventTarget & Record<string, unknown>;
	let idle: (() => void) | undefined;
	beforeEach(() => {
		vi.useFakeTimers();
		events = Object.assign(new EventTarget(), {
			setTimeout,
			clearTimeout,
			requestIdleCallback: vi.fn((callback: () => void) => {
				idle = callback;
				return 1;
			}),
			cancelIdleCallback: vi.fn()
		});
		idle = undefined;
		vi.stubGlobal('window', events);
		vi.stubGlobal('location', { pathname: '/pokedex/example' });
		vi.stubGlobal('document', { querySelector: () => null });
		vi.stubGlobal('requestAnimationFrame', (callback: () => void) => setTimeout(callback, 16));
		vi.stubGlobal('cancelAnimationFrame', clearTimeout);
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('waits for interactive cells, coalesces events, then runs at idle once', () => {
		const run = vi.fn();
		afterCriticalPageWork(run);
		vi.advanceTimersByTime(1000);
		expect(run).not.toHaveBeenCalled();
		events.dispatchEvent(new Event('livingdex:grid-interactive'));
		events.dispatchEvent(new Event('livingdex:grid-interactive'));
		vi.advanceTimersByTime(16);
		expect(events.requestIdleCallback).toHaveBeenCalledTimes(1);
		expect(run).not.toHaveBeenCalled();
		idle!();
		vi.advanceTimersByTime(5000);
		expect(run).toHaveBeenCalledTimes(1);
	});
	it('falls back after five seconds if no grid becomes interactive', () => {
		const run = vi.fn();
		afterCriticalPageWork(run);
		vi.advanceTimersByTime(4999);
		expect(run).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(run).toHaveBeenCalledTimes(1);
	});
	it('cancels work after navigation or an explicit refresh takes over', () => {
		const run = vi.fn();
		const cancel = afterCriticalPageWork(run);
		events.dispatchEvent(new Event('livingdex:grid-interactive'));
		vi.advanceTimersByTime(16);
		cancel();
		idle!();
		vi.advanceTimersByTime(5000);
		expect(run).not.toHaveBeenCalled();
	});
	it('does not announce a grid with no populated cells', () => {
		const listener = vi.fn();
		events.addEventListener('livingdex:grid-interactive', listener);
		markGridInteractive();
		expect(listener).not.toHaveBeenCalled();
	});
	it('schedules other pages without waiting for a grid, even without idle callbacks', () => {
		vi.stubGlobal('location', { pathname: '/backup-settings' });
		delete events.requestIdleCallback;
		const run = vi.fn();
		afterCriticalPageWork(run);
		vi.advanceTimersByTime(32);
		expect(run).toHaveBeenCalledTimes(1);
	});
	it('marks populated cells once and allows work registered after hydration', () => {
		let ready = false;
		const grid = {
			setAttribute: () => {
				ready = true;
			}
		};
		const cell = { closest: () => grid };
		vi.stubGlobal('document', {
			querySelector: (selector: string) =>
				selector === '[data-entry-index]' ? cell : ready ? grid : null
		});
		const mark = vi.fn();
		vi.stubGlobal('performance', { mark });
		markGridInteractive();
		markGridInteractive();
		expect(mark).toHaveBeenCalledTimes(1);
		const run = vi.fn();
		afterCriticalPageWork(run);
		vi.advanceTimersByTime(16);
		idle!();
		expect(run).toHaveBeenCalledTimes(1);
	});
	it('does not access the DOM during SSR', () => {
		vi.stubGlobal('window', undefined);
		expect(() => markGridInteractive()).not.toThrow();
	});
});
