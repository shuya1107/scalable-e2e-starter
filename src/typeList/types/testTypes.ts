
export type ScenarioStep = string[];

export type Test = {
    data: import('./userType').User;
    testScenario: ScenarioStep;
    myFunctionList: import('./functionTypes').ScenarioFunctionList;
}

export type TestGroup = {
    testScenario: ScenarioStep;  // シナリオの配列
    scenarioIndex: number;         // シナリオ番号
    myFunctionList: import('./functionTypes').ScenarioFunctionList;
    mainLogger: import('../../utils/TestLogger').TestLogger | null;
    debugLogger?: import('../../utils/TestLogger').TestLogger | null;
};


