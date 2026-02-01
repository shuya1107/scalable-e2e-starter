import * as fs from 'fs';
import * as path from 'path';

// ★変更点：ここが index.ts (../types) からの一括インポートになりました
import { TestStatus, TestResultData } from '../typeList/index';

export class TestReport {
    // 保存先のパス（プロジェクト直下の execution_report.csv）
    private static filePath = path.join(process.cwd(), 'execution_report.csv');
    
    private startTime: number;
    private data: TestResultData;

    /**
     * コンストラクタ：テスト開始時に呼ばれる
     * 誰の、どのシナリオかを確定させる
     */
    constructor(scenarioId: string, memberCode: string, memberAttributes: any) {
        this.startTime = Date.now();
        
        // 初期状態をセット
        this.data = {
            timestamp: new Date().toLocaleTimeString('ja-JP'),
            scenarioId,
            memberCode,
            memberAttributes,
            status: 'FAIL', // デフォルトはFAILにしておく（途中で落ちた場合のため）
            message: '',
            durationSeconds: 0
        };
    }

    /**
     * 静的メソッド：実行の最初に1回だけ呼んで、ファイルを初期化する
     */
    static initialize() {
        try {
            // もし古いファイルが残っていたら削除してリセットする
            if (fs.existsSync(this.filePath)) {
                fs.unlinkSync(this.filePath);
            }

            // 見出し行を書き込む（BOM付き）
            const header = '実行日時,シナリオID,会員コード,属性,ステータス,メッセージ,処理時間(秒),トレースパス\n';
            fs.writeFileSync(this.filePath, '\uFEFF' + header);
            
            console.log('📝 レポートファイルを初期化しました');
        } catch (e) {
            console.error('レポート初期化エラー:', e);
        }
    }

    /**
     * 結果を確定させる
     */
    setResult(status: TestStatus, message: string = '') {
        this.data.status = status;
        this.data.message = message;
    }

    /**
     * トレースファイルのパスを紐付ける
     */
    setTracePath(path: string) {
        this.data.tracePath = path;
    }

    /**
     * ファイルに保存（追記）する
     */
    save() {
        // 処理時間を計算
        this.data.durationSeconds = (Date.now() - this.startTime) / 1000;

        const line = this.formatToCsv();
        
        try {
            fs.appendFileSync(TestReport.filePath, line);
        } catch (e) {
            console.error(`レポート書き込み失敗 (${this.data.memberCode}):`, e);
        }
    }

    // 内部用：CSV用に整形する（カンマや改行のエスケープ処理）
    private formatToCsv(): string {
        const { timestamp, scenarioId, memberCode, memberAttributes, status, message, durationSeconds, tracePath } = this.data;

        // JSONやメッセージ内の特殊文字を処理 (CSV崩れ防止)
        const safeAttr = JSON.stringify(memberAttributes).replace(/"/g, '""');
        const safeMsg = message.replace(/\r?\n/g, ' ').replace(/"/g, '""');

        // CSVフォーマットで結合
        return `${timestamp},${scenarioId},${memberCode},"${safeAttr}",${status},"${safeMsg}",${durationSeconds},${tracePath || ''}\n`;
    }
}