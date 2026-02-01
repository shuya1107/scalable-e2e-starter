// 型定義の窓口ファイル
// このファイルから全ての型をインポートできる

// ユーザー関連（users.json）
export type { User } from './types/userType';

// ログ関連（utils/TestLogger.ts）
export type { LogContext, LogLevel } from './types/logTypes';

// テストの具体的な操作の関数関連
export type { 
    ActionFn, 
    ActionFnMap, 
    FunctionNameList, 
    ScenarioFunctionList 
} from './types/functionTypes';

// テストシナリオ関連
export type {
    TestExecutionContext,
    TestStrategy,
    TestStrategyRecord,
    ScenarioStep
} from './types/testClassTypes';

// 各テスト固有の関数型定義
export type {
    TestAFunction
} from './types/testFunctionClassify';


// テスト結果レポート関連
export type {
    TestStatus,
    TestResultData
} from './types/testReport';

