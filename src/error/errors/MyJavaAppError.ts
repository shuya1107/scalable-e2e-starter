import { BaseError } from '../errorBaseClass';

/**
 * MyJavaApp関連のエラー
 */
export class MyJavaAppError extends BaseError {
	constructor(
		message: string,
		errorType: 'validation' | 'unknown' = 'validation',
		originalError?: unknown
	) {
		super(
			message,
			errorType,
			'MyJavaApp',
			originalError
		);
	}
}
