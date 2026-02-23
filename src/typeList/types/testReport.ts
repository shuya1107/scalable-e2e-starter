

/**
 * テスト結果のステータス定義
 * SUCCESS: 成功
 * FAIL: システムエラー・バグ（要調査）
 * EXPECTED: 業務上の想定内エラー（調査不要）
 */
export type TestStatus = 'SUCCESS' | 'FAIL' | 'EXPECTED';


/**
 * テストグループ単位のレポート構造
 */
export interface TestGroupLog {
    testName: string;
    description: string;
    logs: TestLogDetail[];
}

/**
 * 実行ログ1件分の構造
 */
export interface TestLogDetail {
    executedAt: string;
    memberCode: string;
    status: TestStatus;
    message: string;
    durationSeconds: number;
    tracePath: string;
    userAttributes: import('./userType').User;
}