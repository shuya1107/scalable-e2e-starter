import type { User, ScenarioStep, ScenarioFunctionList } from '../../typeList/index';
import { RunUserTestDto } from './runUserTestDto';

/**
 * RunUserTestDtoを生成するファクトリー関数
 */
export function runUserTestDtoFactory(params: {
    data: User;
    testList: ScenarioStep;
    myFunctionList: ScenarioFunctionList;
}): RunUserTestDto {
    return new RunUserTestDto(
        params.data,
        params.testList,
        params.myFunctionList
    );
}
