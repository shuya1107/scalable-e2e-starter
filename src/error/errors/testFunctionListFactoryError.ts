import { BaseError } from '../BaseError';

/**
 * testFunctionListFactory 関数のエラー
 */
export class TestFunctionListFactoryError extends BaseError {
    constructor(
        message: string,
        errorType: 'parse' | 'validation' | 'unknown',
        originalError?: unknown
    ) {
        super(
            message, 
            errorType, 
            'testFunctionListFactory', // 関数名はここで固定で渡す
            originalError
        );
    }
}