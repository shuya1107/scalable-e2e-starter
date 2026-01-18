import { test } from '@playwright/test';
import { testContentsListFactory } from '../factory/testContentsListFactory';
import userDataList from '../../testdata/users.json';
import { createStrategies } from '../factory/testFactory';
import { TestLogger } from '../utils/TestLogger';
import { ScenarioStep, user, Test, TestGroup } from '../testDataType/testDataType';
import { testFunctinListFactory } from '../factory/testFunctionListFactory';


//テスト実行関数
export function run() {

    const mainLogger = new TestLogger("./logs", "System.log");

    //JSONの情報からテストのシナリオと関数をそれぞれ配列にする
    const scenarioList = testContentsListFactory();
    const functionList = testFunctinListFactory();

    mainLogger.log(`シナリオリスト: ${JSON.stringify(scenarioList)}`);
    mainLogger.log(`関数リスト:${JSON.stringify(functionList)}`);
    


    //それぞれのテストシナリオで処理を行う
    scenarioList.forEach((testScenario, scenarioIndex) => {

        const myFunctionList = functionList[scenarioIndex];

        runScenarioGroup({
            testScenario,          //テストシナリオの配列が入っている
            scenarioIndex,    //シナリオナンバーが入っている
            myFunctionList,
            mainLogger
        });
    });
    

}


//テストのシナリオを準備をする関数
export function runScenarioGroup({testScenario, scenarioIndex, myFunctionList, mainLogger}: TestGroup) {


    mainLogger.log(`\n=== シナリオグループ ${scenarioIndex + 1} を開始します ===`);

    // レポートで見やすいように「グループ化」
    // シナリオで1人、一つのファイルにまとめて出してくれる
    test.describe(`Scenario Group ${scenarioIndex + 1}`, () => {
        // 会員の情報をとってくる
        // JSONは配列の中に配列でできている　シナリオと会員の情報どちらも同じインデックス番号が対応する
        const targetUsers = userDataList[scenarioIndex];

        // もしシナリオの数より会員の数が少なかった（配列の数）場合スキップして終わらせる。
        if (!targetUsers) {
            mainLogger.log(`異常終了(定義不足): シナリオ番号 ${scenarioIndex} に対応する会員データがありません。`);
            mainLogger.log(`user.json の配列数と testContents.json の配列数を確認してください。`);
            return;
        }

        mainLogger.log(`シナリオ番号 ${scenarioIndex} の会員データ: ${JSON.stringify(targetUsers)}`);

        //テストスタート
        targetUsers.forEach((data:user) => {
            //テストシナリオと会員の情報を渡す
            runUserTest({
                data,         //会員の情報
                testScenario,   //シナリオの配列
                myFunctionList,    //関数のリスト
                mainLogger
            });
        });
    });

}

//次ここからログの追加を行う

//実際にテストを行う関数
export function runUserTest({data, testScenario, myFunctionList, mainLogger}: Test) {

    // レポート用のタイトルに memberCodeを入れてわかりやすくする
    test(`Test - Member: ${data.memberCode} `, async ({ page }, testInfo) => {
        //ログについてのクラス
        const logger = new TestLogger(testInfo.outputDir, `log.txt`);

        try {

            logger.log(`START: Member ${data.memberCode} のテスト開始`);

            //テストのクラスのオブジェクト作成
            const testList = createStrategies(testScenario);

            // テストシナリオを配列の順番通りに進める
            for (let strategyIndex = 0; strategyIndex < testList.length; strategyIndex++) {
                const strategy = testList[strategyIndex];

                await test.step(strategy.stepName, async () => {
                    logger.log(`Step: ${strategy.stepName} を実行中...`);

                    //テスト起動
                    //テスト情報とこのテストで使う関数のリスト、テストの番号を渡す（何番目のテストなのか）
                    const result = await strategy.execute(page, data, myFunctionList, testInfo, strategyIndex);

                    if (!result) {
                        // 失敗したらエラーを投げる（catchに飛ぶ）
                        throw new Error(`${strategy.stepName} で false が返されました`);
                    }
                    logger.log(`Step: ${strategy.stepName} -> OK`);
                });
            }
        } catch (error) {
            logger.log(`ERROR: ${error}`);
            logger.printFailureLogs(data.memberCode);
            throw error;
        }

    });

}


