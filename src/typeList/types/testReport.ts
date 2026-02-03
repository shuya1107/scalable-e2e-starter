/**
 * テスト結果のステータス定義
 * SUCCESS: 成功
 * FAIL: システムエラー・バグ（要調査）
 * EXPECTED: 業務上の想定内エラー（調査不要）
 */
export type TestStatus = 'SUCCESS' | 'FAIL' | 'EXPECTED';

/**
 * レポートデータの構造定義
 */
export interface TestResultData {
    timestamp: string;      // 実行日時
    memberAttributes: any;  // 会員情報(JSON)
    status: TestStatus;     // 結果
    message: string;        // 詳細メッセージ
    tracePath?: string;     // トレースファイルのパス
    durationSeconds: number;// 処理時間(秒)
}