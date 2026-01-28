import { BaseError } from '../errorBaseClass';

/**
 * run 関数のエラー
 * 現状使われていないこれから使うかもしれない
 */
export class RunError extends BaseError {
    constructor(
        message: string,
        errorType: 'initialization' | 'unknown',
        originalError?: unknown
    ) {
        super(
            message, 
            errorType, 
            'run', // 関数名はここで固定で渡す
            originalError
        );
    }
}
