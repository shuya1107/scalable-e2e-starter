import { BaseError } from '../BaseError';

/**
 * RunScenarioGroupService関連のエラー
 */
export class RunScenarioGroupServiceError extends BaseError {
    constructor(
        message: string,
        errorType: 'validation' | 'unknown' = 'validation',
        originalError?: unknown
    ) {
        super(
            message,
            errorType,
            'RunScenarioGroupService',
            originalError
        );
    }
}
