import { test } from '@playwright/test';

// テストデータのインポート
import userDataList from '../../testdata/users.json';

// ログ出力用のクラスと関数
import { TestLogger, formatLogContext } from '../utils/TestLogger';

// エラーハンドリング用の関数
//後でクラス化したほうがいいと思われる
import { errorHandleFactory } from '../error/errorHandler/errorHandler';


import type { LogLevel, User, TestExecutionContext } from '../typeList/index';

// DTOファクトリー関数
import { runUserTestDtoFactory } from '../dto/dtoFactoryIndex';

// DTOの型定義
import { RunScenarioGroupDto, RunUserTestDto } from '../dto/dtoIndex';

import { RunService } from '../service/runService';

/**
 * テスト実行全体を管理する関数
 * 肥大化してしまっているが、関数を分割すると可読性が下がるためあえて分割していない
 * ループ構造が深くなってしっているため
 * 関数で分割をしている
 * これからサービスを作る予定
 */


//テスト実行関数
export function run() {

    //　後でここも別の場所に移したほうがいいと思われる
    //　newがここにいるのが美しくない

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

        const { dtoList } = RunService.createExecutionData(mainLogger, debugLogger);

        // DTOリストをもとにテストシナリオグループを順番に実行していく
        for (const runScenarioGroupDto of dtoList) {
        
            runScenarioGroup(
                runScenarioGroupDto
            );

        }
    } catch (error) {
        // エラーハンドリング用の関数
        errorHandleFactory(error, mainLogger, debugLogger);
    }
    
}

//次はここからサービスを作る予定


//テストのシナリオを準備をする関数
export function runScenarioGroup(runScenarioGroupDto: RunScenarioGroupDto) {

    try {

        // レポートで見やすいように「グループ化」
        // シナリオで1人、一つのファイルにまとめて出してくれる
        test.describe(`Scenario Group ${runScenarioGroupDto.scenarioIndex + 1}`, () => {

            // 会員の情報をとってくる
            // JSONは配列の中に配列でできている　シナリオと会員の情報どちらも同じインデックス番号が対応する
            //　データのチェックのみ
            const targetUsers = userDataList[runScenarioGroupDto.scenarioIndex];

            //nullの可能性があるためのチェック且つ配列に何人のデータが入っているのかを確認する（テスト予定の会員数）
            const plannedMembers = (targetUsers && Array.isArray(targetUsers)) ? targetUsers.length : 0;

            // もしシナリオの数より会員の数が少なかった（配列の数）場合スキップして終わらせる。
            if (!targetUsers) {
                if(runScenarioGroupDto.mainLogger){
                    const ctx = formatLogContext({ scenarioIndex: runScenarioGroupDto.scenarioIndex });
                    runScenarioGroupDto.mainLogger.error(`${ctx}異常終了(定義不足): シナリオ番号 ${runScenarioGroupDto.scenarioIndex + 1} に対応する会員データがありません。`);
                    runScenarioGroupDto.mainLogger.error(`${ctx}user.json の配列数と testContents.json の配列数を確認してください。`);
                }
                return;
            }

            

            // 実行フェーズだけで開始ログを出す
            test.beforeAll(() => {
                const ctx = formatLogContext({ scenarioIndex: runScenarioGroupDto.scenarioIndex });
                runScenarioGroupDto.debugLogger?.debug(`${ctx}runScenarioGroup 開始`);
                runScenarioGroupDto.mainLogger?.info(`${ctx}start: members planned=${plannedMembers}`);
                runScenarioGroupDto.debugLogger?.debug(`${ctx}members detail: ${JSON.stringify(targetUsers)}`);
            });
            

            //テストスタート
            targetUsers.forEach((data:User) => {

                const runUserTestDto: RunUserTestDto = runUserTestDtoFactory({
                    data,   //会員の情報
                    testList: runScenarioGroupDto.testList,   //シナリオの配列
                    myFunctionList: runScenarioGroupDto.myFunctionList   //関数のリスト
                });

                //テストシナリオと会員の情報を渡す
                runUserTest(
                    runUserTestDto
                );
            });

            // シナリオの全テスト完了のログ
            test.afterAll(() => {
                const ctx = formatLogContext({ scenarioIndex: runScenarioGroupDto.scenarioIndex });
                runScenarioGroupDto.mainLogger.info(`${ctx}Scenario Group ${runScenarioGroupDto.scenarioIndex + 1} 完了`);
                runScenarioGroupDto.debugLogger.debug(`${ctx}runScenarioGroup 完了`);
            });
        });
    } catch (error) {
        // 基本的に予期しないエラーのみ飛んでくる意味がないわけではないと思いたい使われないのが一番良い
        errorHandleFactory(error, runScenarioGroupDto.mainLogger, runScenarioGroupDto.debugLogger);
    }
}



//実際にテストを行う関数
export function runUserTest(runUserTestDto: RunUserTestDto) {

    // レポート用のタイトルに memberCodeを入れてわかりやすくする
    test(`Test - Member: ${runUserTestDto.data.memberCode} `, async ({ page }, testInfo) => {
        //ログについてのクラス
        const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
        const logger = new TestLogger(testInfo.outputDir, `log.txt`, logLevel);

        try {
            const baseCtx = formatLogContext({ memberCode: runUserTestDto.data.memberCode });
            logger.info(`${baseCtx}START: Member ${runUserTestDto.data.memberCode} のテスト開始`);

            

            // テストシナリオを配列の順番通りに進める
            for (let strategyIndex = 0; strategyIndex < runUserTestDto.testList.length; strategyIndex++) {
                const strategy = runUserTestDto.testList[strategyIndex];

                await test.step(strategy.stepName, async () => {
                    const stepCtx = formatLogContext({ memberCode: runUserTestDto.data.memberCode, stepName: strategy.stepName });
                    logger.debug(`${stepCtx}Step 実行中`);

                    //テスト起動
                    //テスト情報とこのテストで使う関数のリスト、テストの番号を渡す（何番目のテストなのか）
                    const context: TestExecutionContext = {page, data: runUserTestDto.data, functions: runUserTestDto.myFunctionList, testInfo, strategyIndex};
                    const result = await strategy.execute(context);

                    if (!result) {
                        // 失敗したらエラーを投げる（catchに飛ぶ）
                        throw new Error(`${strategy.stepName} で false が返されました`);
                    }
                    logger.debug(`${stepCtx}Step OK`);
                });
            }
        } catch (error) {
            logger.logError(error, { memberCode: runUserTestDto.data.memberCode });
            logger.printFailureLogs(runUserTestDto.data.memberCode);
            throw error; // エラーを再スローしてテストを失敗させる
        }

    });
}


