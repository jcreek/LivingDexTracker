type InViewParams = {
	rootMargin?: string;
	threshold?: number | number[];
	once?: boolean;
	enabled?: boolean;
	onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
};

const observers = new Map<string, IntersectionObserver>();
const callbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();

function normalizeThreshold(threshold: number | number[] | undefined) {
	if (threshold === undefined) return [0];
	return Array.isArray(threshold) ? threshold : [threshold];
}

function buildObserverKey(rootMargin: string, threshold: number | number[]) {
	return `${rootMargin}|${JSON.stringify(normalizeThreshold(threshold))}`;
}

function getObserver(rootMargin: string, threshold: number | number[]) {
	const key = buildObserverKey(rootMargin, threshold);
	const existing = observers.get(key);
	if (existing) return existing;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const callback = callbacks.get(entry.target);
				if (callback) {
					callback(entry);
				}
			}
		},
		{ rootMargin, threshold }
	);
	observers.set(key, observer);
	return observer;
}

export function inView(node: Element, params: InViewParams = {}) {
	let options: Required<InViewParams> = {
		rootMargin: '200px 0px',
		threshold: 0,
		once: true,
		enabled: true,
		onChange: () => undefined,
		...params
	};

	let observer = getObserver(options.rootMargin, options.threshold);

	const handleEntry = (entry: IntersectionObserverEntry) => {
		const isIntersecting = entry.isIntersecting || entry.intersectionRatio > 0;
		options.onChange(isIntersecting, entry);
		if (isIntersecting && options.once) {
			observer.unobserve(node);
			callbacks.delete(node);
		}
	};

	const startObserving = () => {
		callbacks.set(node, handleEntry);
		observer.observe(node);
	};

	const stopObserving = () => {
		observer.unobserve(node);
		callbacks.delete(node);
	};

	if (options.enabled) {
		startObserving();
	}

	return {
		update(next: InViewParams = {}) {
			const nextOptions: Required<InViewParams> = {
				...options,
				...next,
				onChange: next.onChange ?? options.onChange
			};
			const observerKeyChanged =
				buildObserverKey(options.rootMargin, options.threshold) !==
				buildObserverKey(nextOptions.rootMargin, nextOptions.threshold);
			const enabledChanged = options.enabled !== nextOptions.enabled;

			if (observerKeyChanged || enabledChanged) {
				stopObserving();
			}

			options = nextOptions;

			if (observerKeyChanged) {
				observer = getObserver(options.rootMargin, options.threshold);
			}

			if (options.enabled) {
				startObserving();
			}
		},
		destroy() {
			stopObserving();
		}
	};
}
