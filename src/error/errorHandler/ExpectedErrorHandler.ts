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

        // エラーオブジェクトを any にキャストして、プロパティがあるか覗き見る
        const e = error as any;
        const allowedStatus = e.allowedStatus; // エラー側が指定する「許可されたステータス」

        // -----------------------------------------------------------
        // 1. エラー側が「許可ステータス」を持っている場合
        // -----------------------------------------------------------
        if (allowedStatus) {
            
            // ★ステータスの答え合わせ
            if (allowedStatus === currentUserStatus) {
                // 【一致】 正解！ (例: lockedユーザーでロックエラー)
                const msg = `[ステータス一致] ユーザー状態: ${currentUserStatus}, エラー: ${e.name}`;
                this.mainLogger.info(`[EXPECTED] ${msg}`);
                
                // レポートには「成功（期待通り）」として記録
                report.setResult('EXPECTED', `${msg} - ${e.message}`);
                return; // 終了

            } else {
                // 【不一致】 不正解！ (例: activeユーザーでロックエラー)
                const msg = `ステータス不一致: ユーザーは "${currentUserStatus}" ですが、"${allowedStatus}" 時専用のエラーが発生しました`;
                
                this.mainLogger.error(`[FAIL] ${msg}`);
                this.debugLogger.error(`Stack: ${e.stack}`);
                
                report.setResult('FAIL', `${msg} - ${e.message}`);
                return; // 終了
            }
        }

        // -----------------------------------------------------------
        // 2. 想定内エラークラスだが、許可ステータスを持っていない場合
        // -----------------------------------------------------------
        // ※上のif文で return しているので、ここに来る時点で allowedStatus は undefined です
        
        if (error instanceof ExpectedErrorBaseClass) {
            // ケースA: データ定義不足
            // 「想定内エラー」として投げられたが、どのステータスで許されるか定義されていない
            // または、現在のステータスでは許可されていない汎用エラーとみなされる
            
            const failMessage = `データ定義不足: "${e.name}" が発生しましたが、このステータス (${currentUserStatus}) では想定されていません (allowedStatusが未定義)`;

            this.mainLogger.error(`[FAIL] テスト準備不足またはバグ: ${failMessage}`);
            this.debugLogger.error(`Stack: ${e.stack}`);

            // ★修正: ここでレポートに書かないと、結果がFAILになりません！
            report.setResult('FAIL', failMessage); 
            return;
        }
        
        // -----------------------------------------------------------
        // 3. そもそも想定外のシステムエラー (ケースB)
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