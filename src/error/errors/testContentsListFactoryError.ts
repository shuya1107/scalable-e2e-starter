/**
 * testContentsListFactory 関数のエラー
 */
export class TestContentsListFactoryError extends Error {
    constructor(
        message: string,
        public errorType?: 'parse' | 'validation' | 'unknown',
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'TestContentsListFactoryError';
    }
}