import { test } from '@playwright/test';
import { testContentsListFactory } from '../factory/testContentsListFactory';
import userDataList from '../../testdata/users.json';
import { createStrategies } from '../factory/testFactory';
import { TestLogger, formatLogContext } from '../utils/TestLogger';
import type { LogLevel, User, Test, TestGroup, TestExecutionContext, ScenarioStep, ScenarioFunctionList } from '../typeList/index';
import { testFunctionListFactory } from '../factory/testFunctionListFactory';
import { errorHandleFactory } from '../error/errorHandler/errorHandler';

//テスト実行関数
export function run() {

    // 「自分が何番目の作業員か」を確認する。
    const workerIndex = process.env.TEST_WORKER_INDEX ;

    const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    const workerTag = (workerIndex ?? '0').toString(); // Playwrightが未設定のときは0扱いにする
    const mainLogger = new TestLogger("./logs", `System.worker-${workerTag}.log`, logLevel);
    const mainDebugLogger = new TestLogger("./logs", `System.worker-${workerTag}.debug.log`, 'debug');

    // デバッグ用のログファイルがない場合はメインのログファイルに書くようにしている
    //ただしメインログファイルはINFO以上しか書き込まないためDEBUGログは出力されない
    const debugLogger = mainDebugLogger ?? mainLogger;

    try{
        // テストデータの初期化
        //JSONの情報からテストのシナリオと関数をそれぞれ配列にする
        let scenarioList: string[][] = testContentsListFactory();
        let functionList: ScenarioFunctionList[] = testFunctionListFactory();


        //全体のシナリオ数と会員数を取得する
        const totalScenarios = scenarioList.length;
        const totalMembers = userDataList.reduce((sum, users) => sum + ((users && Array.isArray(users)) ? users.length : 0), 0);

        // 実行フェーズだけで開始ログを出す（テスト収集フェーズでは出さない）
        test.beforeAll(() => {
            if (mainLogger) {
                mainLogger.info(`=====================================`);
                mainLogger.info(`${new Date()} テスト実行を開始します`);
                mainLogger.info(`総シナリオ数=${totalScenarios} 総メンバー数=${totalMembers}`);
                // シナリオ・関数リストはデバッグ用途
                mainLogger.debug(`シナリオリスト: ${JSON.stringify(scenarioList)}`);
                mainLogger.debug(`関数リスト: ${JSON.stringify(functionList)}`);
            }
        });


        //それぞれのテストシナリオで処理を行う
        scenarioList.forEach((testScenario, scenarioIndex) => {

        const myFunctionList = functionList[scenarioIndex];

        //テストのクラスのオブジェクト作成
        const testList = createStrategies(testScenario);

            runScenarioGroup({
                testList,          //テストシナリオの配列が入っている
                scenarioIndex,    //シナリオナンバーが入っている
                myFunctionList,
                mainLogger,
                debugLogger
            });
        });
    } catch (error) {
        // エラーハンドリング用の関数
        errorHandleFactory(error, mainLogger, debugLogger);
    }
    
}


//テストのシナリオを準備をする関数
export function runScenarioGroup({testList, scenarioIndex, myFunctionList, mainLogger, debugLogger}: TestGroup) {

    try {

        // レポートで見やすいように「グループ化」
        // シナリオで1人、一つのファイルにまとめて出してくれる
        test.describe(`Scenario Group ${scenarioIndex + 1}`, () => {

            // 会員の情報をとってくる
            // JSONは配列の中に配列でできている　シナリオと会員の情報どちらも同じインデックス番号が対応する
            //　データのチェックのみ
            const targetUsers = userDataList[scenarioIndex];

            //nullの可能性があるためのチェック且つ配列に何人のデータが入っているのかを確認する（テスト予定の会員数）
            const plannedMembers = (targetUsers && Array.isArray(targetUsers)) ? targetUsers.length : 0;

            // もしシナリオの数より会員の数が少なかった（配列の数）場合スキップして終わらせる。
            if (!targetUsers) {
                if(mainLogger){
                    const ctx = formatLogContext({ scenarioIndex });
                    mainLogger.error(`${ctx}異常終了(定義不足): シナリオ番号 ${scenarioIndex + 1} に対応する会員データがありません。`);
                    mainLogger.error(`${ctx}user.json の配列数と testContents.json の配列数を確認してください。`);
                }
                return;
            }

            

            // 実行フェーズだけで開始ログを出す
            test.beforeAll(() => {
                const ctx = formatLogContext({ scenarioIndex });
                debugLogger?.debug(`${ctx}runScenarioGroup 開始`);
                mainLogger?.info(`${ctx}start: members planned=${plannedMembers}`);
                debugLogger?.debug(`${ctx}members detail: ${JSON.stringify(targetUsers)}`);
            });
            

            //テストスタート
            targetUsers.forEach((data:User) => {
                //テストシナリオと会員の情報を渡す
                runUserTest({
                    data,         //会員の情報
                    testList,   //シナリオの配列
                    myFunctionList   //関数のリスト
                });
            });

            // シナリオの全テスト完了のログ
            test.afterAll(() => {
                const ctx = formatLogContext({ scenarioIndex });
                mainLogger.info(`${ctx}Scenario Group ${scenarioIndex + 1} 完了`);
                debugLogger.debug(`${ctx}runScenarioGroup 完了`);
            });
        });
    } catch (error) {
        // 基本的に予期しないエラーのみ飛んでくる意味がないわけではないと思いたい使われないのが一番良い
        errorHandleFactory(error, mainLogger, debugLogger);
    }
}



//実際にテストを行う関数
export function runUserTest({data, testList, myFunctionList}: Test) {

    // レポート用のタイトルに memberCodeを入れてわかりやすくする
    test(`Test - Member: ${data.memberCode} `, async ({ page }, testInfo) => {
        //ログについてのクラス
        const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
        const logger = new TestLogger(testInfo.outputDir, `log.txt`, logLevel);

        try {
            const baseCtx = formatLogContext({ memberCode: data.memberCode });
            logger.info(`${baseCtx}START: Member ${data.memberCode} のテスト開始`);

            

            // テストシナリオを配列の順番通りに進める
            for (let strategyIndex = 0; strategyIndex < testList.length; strategyIndex++) {
                const strategy = testList[strategyIndex];

                await test.step(strategy.stepName, async () => {
                    const stepCtx = formatLogContext({ memberCode: data.memberCode, stepName: strategy.stepName });
                    logger.debug(`${stepCtx}Step 実行中`);

                    //テスト起動
                    //テスト情報とこのテストで使う関数のリスト、テストの番号を渡す（何番目のテストなのか）
                    const context: TestExecutionContext = {page, data, functions: myFunctionList, testInfo, strategyIndex};
                    const result = await strategy.execute(context);

                    if (!result) {
                        // 失敗したらエラーを投げる（catchに飛ぶ）
                        throw new Error(`${strategy.stepName} で false が返されました`);
                    }
                    logger.debug(`${stepCtx}Step OK`);
                });
            }
        } catch (error) {
            logger.logError(error, { memberCode: data.memberCode });
            logger.printFailureLogs(data.memberCode);
            throw error; // エラーを再スローしてテストを失敗させる
        }

    });
}


