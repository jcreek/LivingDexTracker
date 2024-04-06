export function getEnv() {
	return {
		MONGO_URL: import.meta.env.VITE_MONGO_URL
	};
}
