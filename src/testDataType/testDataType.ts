import { TestLogger } from "../utils/TestLogger";



//型定義後から変更になっても問題ない追加するだけならね（interface)JSONも変更しないとだけど
export type ScenarioStep = string[];

export interface user {
    memberCode: string;
    key: string;
}

export type Test = {
    data: user;
    testScenario: ScenarioStep;
    myFunctionList: any[];
}

export type TestGroup = {
    testScenario: any;  // シナリオの配列
    scenarioIndex: number;     // シナリオ番号
    myFunctionList : any[];
    mainLogger: TestLogger | null;
    mainDebugLogger?: TestLogger | null;
};