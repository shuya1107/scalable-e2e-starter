import type { ScenarioStep, ScenarioFunctionList } from '../../typeList/index';
import type { TestLogger } from '../../utils/TestLogger';

/**
 * runScenarioGroup関数に渡す引数をまとめたDTO
 */
export class RunScenarioGroupDto {
    
    constructor(
        /** テストシナリオの配列 */
        public readonly testList: ScenarioStep,
        /** シナリオ番号 */
        public readonly scenarioIndex: number,
        /** シナリオで使用する関数のリスト */
        public readonly myFunctionList: ScenarioFunctionList,
        /** メインログ出力用のロガー */
        public readonly mainLogger: TestLogger,
        /** デバッグログ出力用のロガー */
        public readonly debugLogger: TestLogger
    ) {}
}
