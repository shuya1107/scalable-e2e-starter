import type { ScenarioStep, ScenarioFunctionList } from '../../typeList/index';
import type { TestLogger } from '../../utils/TestLogger';
import { RunScenarioGroupDto, ScenarioContent } from '../runScenarioGroup/runScenarioGroupDto';

/**
 * RunScenarioGroupDtoを生成するファクトリー関数
 * * バラバラの素材を受け取って、
 * { testName, description, contents: { testList... } }
 * の形に組み立てて返す工場
 */
export function runScenarioGroupDtoFactory(params: {
    // ■ 追加: 名前と説明を受け取る
    testName: string;
    description: string;
    
    scenarioIndex: number;
    testList: ScenarioStep;
    myFunctionList: ScenarioFunctionList;
    mainLogger: TestLogger;
    debugLogger: TestLogger;
}): RunScenarioGroupDto {

    // 1. 実行データ部分をオブジェクトにまとめる（ScenarioContentの形）
    const contentData: ScenarioContent = {
        testList: params.testList,
        myFunctionList: params.myFunctionList,
        mainLogger: params.mainLogger,
        debugLogger: params.debugLogger
    };

    // 2. 新しいDTOの構造に合わせてインスタンス化
    return new RunScenarioGroupDto(
        params.testName,     // 名前
        params.description,  // 説明
        params.scenarioIndex,
        contentData     // ★ここ！オブジェクト
    );
}