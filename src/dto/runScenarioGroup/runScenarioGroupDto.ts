import type { ScenarioStep, ScenarioFunctionList } from '../../typeList/index';
import type { TestLogger } from '../../utils/TestLogger';

/**
 * contentsの中身（実行に必要なデータセット）の定義
 */
export interface ScenarioContent {
    /** テストシナリオの配列 (TestA, TestB...) */
    testList: ScenarioStep;
    /** シナリオで使用する関数のリスト (["open"], ["search"]...) */
    myFunctionList: ScenarioFunctionList;
    /** メインログ出力用のロガー */
    mainLogger: TestLogger;
    /** デバッグログ出力用のロガー */
    debugLogger: TestLogger;
}

/**
 * runScenarioGroup関数に渡す引数をまとめたDTO
 */
export class RunScenarioGroupDto {
    
    constructor(
        /** テストシナリオ名 (testSampleA) */
        public readonly testName: string,

        /** テストの説明 */
        public readonly description: string,

        /** シナリオ番号 */
        public readonly scenarioIndex: number,

        /** 実行データ (ここにtestListやloggerをまとめる) */
        public readonly contents: ScenarioContent
    ) {}
}