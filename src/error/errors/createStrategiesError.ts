import { BaseError } from '../BaseError';

/**
 * createStrategies 関数のエラー
 */
export class CreateStrategiesError extends BaseError {
    constructor(
        message: string,
        errorType: 'parse' | 'validation' | 'unknown',
        originalError?: unknown
    ) {
        super(
            message, 
            errorType, 
            'createStrategies', // 関数名はここで固定で渡す
            originalError
        );
    }
}