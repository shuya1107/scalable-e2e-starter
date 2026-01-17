import { test } from '@playwright/test';
import { testContentsListFactory } from '../factory/testContentsListFactory';
import userDataList from '../../testdata/users.json';
import { createStrategies } from '../factory/testFactory';
import { TestLogger } from '../utils/TestLogger';
import { ScenarioStep, user, Test } from '../testDataType/testDataType';
import { testFunctinListFactory } from '../factory/testFunctionListFactory';


//テスト実行関数
export function run() {

    //JSONの情報からテストのシナリオと関数をそれぞれ配列にする
    const scenarioList = testContentsListFactory();
    const functionList = testFunctinListFactory();

    console.log('シナリオリスト:', scenarioList);
    console.log('関数リスト:', functionList);
    


    //それぞれのテストシナリオで処理を行う
    scenarioList.forEach((testScenario, scenarioIndex) => {

        const myFunctionList = functionList[scenarioIndex];

        runScenarioGroup({
            scenarios: testScenario,          //テストシナリオの配列が入っている
            scenarioNumber: scenarioIndex,    //シナリオナンバーが入っている
            functions : myFunctionList
        });
    });
    

}



type TestGroup = {
    scenarios: any;  // シナリオの配列
    scenarioNumber: number;     // シナリオ番号
    functions : any;
};

//テストのシナリオを準備をする関数
export function runScenarioGroup({scenarios, scenarioNumber, functions}: TestGroup) {

    // レポートで見やすいように「グループ化」
    // シナリオで1人、一つのファイルにまとめて出してくれる
    test.describe(`Scenario Group ${scenarioNumber + 1}`, () => {

        // 会員の情報をとってくる
        // JSONは配列の中に配列でできている　シナリオと会員の情報どちらも同じインデックス番号が対応する
        const targetUsers = userDataList[scenarioNumber];

        // もしシナリオの数より会員の数が少なかった（配列の数）場合スキップして終わらせる。
        if (!targetUsers) return;

        //テストスタート
        targetUsers.forEach((data:user) => {
            //テストシナリオと会員の情報を渡す
            runUserTest({
                userData: data,         //会員の情報
                scenarios: scenarios,   //シナリオの配列
                functions: functions    //関数のリスト
            });
        });
    });

}



//実際にテストを行う関数
export function runUserTest({userData, scenarios, functions}: Test) {

    // レポート用のタイトルに memberCodeを入れてわかりやすくする
    test(`Test - Member: ${userData.memberCode} `, async ({ page }, testInfo) => {


        //ログについてのクラス
        const logger = new TestLogger(testInfo.outputDir);

        try {

            logger.log(`START: Member ${userData.memberCode} のテスト開始`);

            //テストのクラスのオブジェクト作成
            const testList = createStrategies(scenarios);

            // テストシナリオを配列の順番通りに進める
            for (const strategy of testList) {

                await test.step(strategy.stepName, async () => {
                    logger.log(`Step: ${strategy.stepName} を実行中...`);

                    //テスト起動
                    const result = await strategy.execute(page, userData,functions);

                    if (!result) {
                        // 失敗したらエラーを投げる（catchに飛ぶ）
                        throw new Error(`${strategy.stepName} で false が返されました`);
                    }
                    logger.log(`Step: ${strategy.stepName} -> OK`);
                });
            }
        } catch (error) {
            logger.log(`ERROR: ${error}`);
            logger.printFailureLogs(userData.memberCode);
            throw error;
        }

    });

}


