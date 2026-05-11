let trackEventImpl = null;

(async () => {
	try {
		trackEventImpl = (eventName, props = {}) => {
			if (typeof window !== 'undefined' && window.plausible) {
				window.plausible(eventName, { props });
			}
		};
	} catch (err) {
		console.warn('Failed to load EventTracking:', err);
		trackEventImpl = () => {};
	}
})();

export function trackEvent(eventName, props = {}) {
	if (trackEventImpl) {
		trackEventImpl(eventName, props);
	}
}
