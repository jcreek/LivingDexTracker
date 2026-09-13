import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;

	for (let index = 0; index < text.length; index++) {
		const char = text[index];
		if (char === '"') {
			if (quoted && text[index + 1] === '"') {
				cell += '"';
				index++;
			} else {
				quoted = !quoted;
			}
		} else if (char === ',' && !quoted) {
			row.push(cell);
			cell = '';
		} else if ((char === '\n' || char === '\r') && !quoted) {
			if (char === '\r' && text[index + 1] === '\n') index++;
			row.push(cell);
			if (row.some((value) => value.length > 0)) rows.push(row);
			row = [];
			cell = '';
		} else {
			cell += char;
		}
	}

	if (quoted) throw new Error('Malformed CSV: unclosed quoted field');
	if (cell.length > 0 || row.length > 0) {
		row.push(cell);
		if (row.some((value) => value.length > 0)) rows.push(row);
	}

	const [headers, ...records] = rows;
	if (!headers) return [];
	return records.map((record, rowIndex) => {
		if (record.length !== headers.length) {
			throw new Error(
				`Malformed CSV row ${rowIndex + 2}: expected ${headers.length} columns, received ${record.length}`
			);
		}
		return Object.fromEntries(
			headers.map((header, index) => [header.trim(), record[index].trim()])
		);
	});
}

export function readRepoCsv(relativePath: string): CsvRow[] {
	return parseCsv(readFileSync(resolve(process.cwd(), relativePath), 'utf8'));
}

export function normalizedIdentity(...parts: Array<string | null | undefined>): string {
	return parts.map((part) => (part ?? '').trim().toLocaleLowerCase('en-GB')).join('|');
}
