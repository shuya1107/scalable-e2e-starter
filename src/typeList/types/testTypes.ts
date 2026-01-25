import { TestStrategy } from './testClassTypes';

export type ScenarioStep = TestStrategy[];

export type Test = {
    data: import('./userType').User;
    testList: ScenarioStep;
    myFunctionList: import('./functionTypes').ScenarioFunctionList;
}

export type TestGroup = {
    testList: ScenarioStep;  // シナリオの配列
    scenarioIndex: number;         // シナリオ番号
    myFunctionList: import('./functionTypes').ScenarioFunctionList;
    mainLogger: import('../../utils/TestLogger').TestLogger;
    debugLogger: import('../../utils/TestLogger').TestLogger ;
};


