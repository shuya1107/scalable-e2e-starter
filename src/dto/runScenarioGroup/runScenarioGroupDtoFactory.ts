import type { ScenarioStep, ScenarioFunctionList } from '../../typeList/index';
import type { TestLogger } from '../../utils/TestLogger';
import { RunScenarioGroupDto } from '../runScenarioGroup/runScenarioGroupDto';

/**
 * RunScenarioGroupDtoを生成するファクトリー関数
 */
export function runScenarioGroupDtoFactory(params: {
    testList: ScenarioStep;
    scenarioIndex: number;
    myFunctionList: ScenarioFunctionList;
    mainLogger: TestLogger;
    debugLogger: TestLogger;
}): RunScenarioGroupDto {
    return new RunScenarioGroupDto(
        params.testList,
        params.scenarioIndex,
        params.myFunctionList,
        params.mainLogger,
        params.debugLogger
    );
}
