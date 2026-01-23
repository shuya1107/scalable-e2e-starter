// ログに関する型定義

// ログの共通プレフィックスを生成するためのコンテキスト
export type LogContext = {
    scenarioIndex?: number;
    memberCode?: string;
    stepName?: string;
};

export type LogLevel = 'debug' | 'info' | 'error';
//debug 開発中のメモ
//info テストのログ（通常はこちら）
//error エラーログ
