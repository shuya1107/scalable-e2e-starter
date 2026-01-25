import type { TestLogger } from '../../utils/TestLogger';
import { BaseFactoryError } from '../errorBaseClass';

export function runErrorHandleFactory(
    error: unknown,
    mainLogger: TestLogger,
    debugLogger: TestLogger,
    originalError?: unknown
): never {
    if (error instanceof BaseFactoryError) {
        const errorTypeMsg = error.errorType === 'validation' 
            ? 'データ検証エラー' 
            : error.errorType === 'parse' 
            ? 'JSONパースエラー' 
            : '予期しないエラー';
        
        // 親クラスが functionName を持っているので、そのまま使えばOK
        // (例: 'testContentsListFactory' や 'testFunctionListFactory' が自動で入る)
        debugLogger.error(`[${errorTypeMsg}] ${error.functionName}: ${error.message}`);
        
        // error.name には自動で「TestContentsListFactoryError」などのクラス名が入っている
        mainLogger.logError(error, error.name);
        
        if (error.errorType === 'validation') {
            // ファイル名も共通ならそのままでOK
            mainLogger.error('\n❌ testContent.json のデータ構造を確認してください');
            mainLogger.error(`詳細: ${error.message}\n`);
        }
        throw error;
    }

    // その他の予期しないエラー
    const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : JSON.stringify(error);

    debugLogger.error(`予期しないエラーが発生しました: ${errorMessage}`);
    if (error instanceof Error && error.stack) {
        debugLogger.error(`スタックトレース: ${error.stack}`);
    }
    mainLogger.logError(error, 'UnexpectedError');
    mainLogger.error('\n❌ テスト実行の初期化中に予期しないエラーが発生しました');
    mainLogger.error(`エラー内容: ${errorMessage}\n`);
    throw error;
}