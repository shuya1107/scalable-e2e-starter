import type { User, ScenarioStep, ScenarioFunctionList } from '../../typeList/index';

/**
 * runUserTest関数に渡す引数をまとめたDTO
 */
export class RunUserTestDto {
    constructor(
        /** 会員の情報 */
        public readonly data: User,
        /** テスト名 */
        public readonly testName: string,
        /** テストの説明 */
        public readonly description: string,
        /** シナリオの配列 */
        public readonly testList: ScenarioStep,
        /** 関数のリスト */
        public readonly myFunctionList: ScenarioFunctionList
    ) {}
}
