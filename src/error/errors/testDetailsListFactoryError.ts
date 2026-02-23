import { BaseError } from '../BaseError';

/**
 * testDetailsListFactory 関数のエラー
 */
export class TestDetailsListFactoryError extends BaseError {
    constructor(
        message: string,
        errorType: 'parse' | 'validation' | 'unknown',
        originalError?: unknown
    ) {
        super(
            message, 
            errorType, 
            'testDetailsListFactory', // 関数名はここで固定で渡す
            originalError
        );
    }
}