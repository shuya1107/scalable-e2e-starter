import type { TestLogger } from '../../utils/TestLogger';
import { ExpectedErrorBaseClass } from '../ExpectedErrorBaseClass';
import { TestReport } from '../../report/TestReport';

export class ExpectedErrorHandler {

    constructor(
        private mainLogger: TestLogger,
        private debugLogger: TestLogger
    ) {}

    /**
     * 想定内のエラーをハンドリングする
     * ここに来るエラーは「失敗」ではなく「条件分岐の一種」として扱う
     */
    async handle(
        error: unknown,
        report: TestReport,
        currentUserStatus: string
    ): Promise<void> {

        // ★ 1. いきなり「自作の想定内エラー」かどうかを判定する（型ガード）
        if (error instanceof ExpectedErrorBaseClass) {
            
            // この中に入れば、error は ExpectedErrorBaseClass 型として保証されるため
            // any キャスト不要で allowedStatus や name に安全にアクセスできます！
            const allowedStatus = error.allowedStatus; 

            // -----------------------------------------------------------
            // 2. ステータスの答え合わせ
            // -----------------------------------------------------------
            if (allowedStatus === currentUserStatus) {
                // 【一致】 正解！ (例: lockedユーザーでロックエラー)
                const msg = `[ステータス一致] ユーザー状態: ${currentUserStatus}, エラー: ${error.name}`;
                this.mainLogger.info(`[EXPECTED] ${msg}`);
                
                // レポートには「成功（期待通り）」として記録
                report.setResult('EXPECTED', `${msg} - ${error.message}`);
                return; // 終了

            } else {
                // 【不一致】 不正解！ (例: activeユーザーでロックエラー)
                const msg = `ステータス不一致: ユーザーは "${currentUserStatus}" ですが、"${allowedStatus}" 時専用のエラーが発生しました`;
                
                this.mainLogger.error(`[FAIL] ${msg}`);
                if (error.stack) {
                    this.debugLogger.error(`Stack: ${error.stack}`);
                }
                
                report.setResult('FAIL', `${msg} - ${error.message}`);
                return; // 終了
            }
        }

        // -----------------------------------------------------------
        // 3. そもそも想定外のシステムエラー (自作クラスではない場合)
        // -----------------------------------------------------------
        const unexpectedMsg = error instanceof Error ? error.message : String(error);
        
        this.mainLogger.error(`[FAIL] 想定内エラーを期待しましたが、予期しないエラーが発生しました`);
        this.mainLogger.error(`詳細: ${unexpectedMsg}`);
        
        if (error instanceof Error && error.stack) {
             this.debugLogger.error(`Stack: ${error.stack}`);
        }
        
        report.setResult('FAIL', `予期しないエラー: ${unexpectedMsg}`);
    }
}