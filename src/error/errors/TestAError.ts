import { BaseError } from '../BaseError';

/**
 * TestA関連のエラー
 */
export class TestAError extends BaseError {
	constructor(
		message: string,
		errorType: 'validation' | 'unknown' = 'validation',
		originalError?: unknown
	) {
		super(
			message,
			errorType,
			'TestA',
			originalError
		);
	}
}
