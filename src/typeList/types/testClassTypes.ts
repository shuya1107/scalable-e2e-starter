import { Page, TestInfo } from '@playwright/test';

export type TestExecutionContext = {
    page: Page;
    data: import('./userType').User;
    functions: import('./functionTypes').ScenarioFunctionList;
    testInfo: TestInfo;
    strategyIndex: number;
};

export interface TestStrategy {

    //レポートに表示するステップ名（処理の題名、システム名とかかな)
    stepName: string;

    //真偽値を返すことでテストが失敗したときに終了させるようにする
    execute(context: TestExecutionContext): Promise<void>;

}

export type  TestStrategyRecord = Record<string, { new(): TestStrategy }>;

//システムごとのクラスが入る配列の型定義
export type ScenarioStep = TestStrategy[];