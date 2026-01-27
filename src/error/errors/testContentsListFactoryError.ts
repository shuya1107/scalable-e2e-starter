import { BaseError } from '../errorBaseClass';

/**
 * testContentsListFactory 関数のエラー
 */
export class TestContentsListFactoryError extends BaseError {
    constructor(
        message: string,
        errorType: 'parse' | 'validation' | 'unknown',
        originalError?: unknown
    ) {
        super(
            message, 
            errorType, 
            'testContentsListFactory', // 関数名はここで固定で渡す
            originalError
        );
    }
}