import type { TestLogger } from '../../utils/TestLogger';
import { BaseError } from '../BaseError';

export class SystemErrorHandler {

    constructor(
        private mainLogger: TestLogger,
        private debugLogger: TestLogger
    ) {}

    /**
     * 
     * @param error
     * こ奴は自分がエラーハンドリングで投げたエラー
     *  
     * @param originalError
     * こ奴はエラーの根本的な原因となったエラー
     * こいつのせいでerrorが発生した場合に渡す
     */
    handle(
        error: unknown,
        originalError?: unknown
    ): never {

        // もし引数で originalError が渡されなかった場合でも、
        // error の中身（プロパティ）に originalError が隠れていないか確認する
        let causedBy = originalError;
        
        if (!causedBy && error instanceof BaseError && error.originalError) {
            causedBy = error.originalError;
        }

        // ほかにエラーが発生した場合、元のエラー情報があれば表示する
        if (causedBy) {
            const origMsg = causedBy instanceof Error ? causedBy.message : String(causedBy);
            const origStack = causedBy instanceof Error ? causedBy.stack : '';
            
            this.debugLogger.error(`💡 根本原因 (Caused by): ${origMsg}`);
            if (origStack) {
                this.debugLogger.error(`   Stack: ${origStack}`);
            }
        }

        if (error instanceof BaseError) {
            const errorTypeMsg = error.errorType === 'validation' 
                ? 'データ検証エラー' 
                : error.errorType === 'parse' 
                ? 'JSONパースエラー' 
                : '予期しないエラー';
            
            // 親クラスが functionName を持っているので、そのまま使えばOK
            // (例: 'testContentsListFactory' や 'testFunctionListFactory' が自動で入る)
            this.debugLogger.error(`[${errorTypeMsg}] ${error.functionName}: ${error.message}`);
            
            // error.name には自動で「TestContentsListFactoryError」などのクラス名が入っている
            this.mainLogger.logError(error, error.name);
            
            if (error.errorType === 'validation') {
                // ファイル名も共通ならそのままでOK
                this.mainLogger.error('\n❌ testContent.json のデータ構造を確認してください');
                this.mainLogger.error(`詳細: ${error.message}\n`);
            }
            throw error;
        }

        // その他の予期しないエラー
        const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : JSON.stringify(error);

        this.debugLogger.error(`予期しないエラーが発生しました: ${errorMessage}`);
        if (error instanceof Error && error.stack) {
            this.debugLogger.error(`スタックトレース: ${error.stack}`);
        }
        this.mainLogger.logError(error, 'UnexpectedError');
        this.mainLogger.error('\n❌ テスト実行の初期化中に予期しないエラーが発生しました');
        this.mainLogger.error(`エラー内容: ${errorMessage}\n`);
        throw error;
    }
}