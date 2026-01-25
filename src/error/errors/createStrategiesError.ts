import { BaseFactoryError } from '../errorBaseClass';

/**
 * createStrategies 関数のエラー
 */
export class CreateStrategiesError extends BaseFactoryError {
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