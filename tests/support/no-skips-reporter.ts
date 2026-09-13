import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

export default class NoSkipsReporter implements Reporter {
	private skipped: string[] = [];

	onTestEnd(test: TestCase, result: TestResult) {
		if (result.status === 'skipped') this.skipped.push(test.titlePath().join(' › '));
	}

	onEnd(result: FullResult) {
		if (this.skipped.length === 0) return;
		for (const title of this.skipped)
			process.stderr.write(`Unexpected skipped BDD scenario: ${title}\n`);
		return { status: 'failed' as const, startTime: result.startTime, duration: result.duration };
	}
}
