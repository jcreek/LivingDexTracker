import { describe, expect, it } from 'vitest';
import { calculateBoxNumbers, calculateBoxPlacement } from '../../src/lib/utils/boxPlacement';

describe('box placement', () => {
	it.each([
		[0, { box: 1, row: 1, column: 1 }],
		[5, { box: 1, row: 1, column: 6 }],
		[6, { box: 1, row: 2, column: 1 }],
		[29, { box: 1, row: 5, column: 6 }],
		[30, { box: 2, row: 1, column: 1 }]
	])('places zero-based entry %i in its box grid', (index, expected) => {
		expect(calculateBoxPlacement(index)).toEqual(expected);
	});

	it.each([
		[0, []],
		[1, [1]],
		[30, [1]],
		[31, [1, 2]],
		[1025, Array.from({ length: 35 }, (_, index) => index + 1)]
	])('calculates box numbers for %i entries', (count, expected) => {
		expect(calculateBoxNumbers(count)).toEqual(expected);
	});
});
