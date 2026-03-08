import { BaseError } from '../BaseError';

/**
 * A_B_Testingに関するエラーを表すクラス
 */
export class A_B_TestingError extends BaseError {
    constructor(
        message: string,
        errorType: 'validation' | 'unknown' = 'validation',
        originalError?: unknown
    ) {
        super(
            message,
            errorType,
            'A_B_Testing',
            originalError
        );
    }
}
