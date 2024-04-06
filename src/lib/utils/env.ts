export function getEnv() {
	return process.env.hasOwnProperty('MONGO_URL')
		? process.env
		: {
				MONGO_URL: import.meta.env.VITE_MONGO_URL
			};
}
