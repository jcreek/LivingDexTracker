/**
 * Stands in for `$env/dynamic/private` so modules that reach for runtime env can be unit
 * tested. Vitest maps the virtual module here; see vitest.config.mts.
 */
export const env: Record<string, string | undefined> = process.env;
