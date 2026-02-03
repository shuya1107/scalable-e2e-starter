import { test } from '@playwright/test';

// テストデータのインポート
import userDataList from '../../testdata/users.json';

// ログ出力用のクラスと関数
import { TestLogger } from '../utils/TestLogger';

// 型定義
import type { ScenarioFunctionList, TestStrategy, LogLevel } from '../typeList/index';

// DTOファクトリー関数
import { runScenarioGroupDtoFactory } from '../dto/dtoFactoryIndex';

// DTOの型定義
import { RunScenarioGroupDto } from '../dto/dtoIndex';

// ファクトリー関数
import { testFunctionListFactory, createStrategies, testContentsListFactory } from '../factory/factoryIndex';

import { SystemErrorHandler } from '../error/errorHandler/SystemErrorHandler';

export class RunService {

    private readonly mainLogger: TestLogger;
    private readonly debugLogger: TestLogger;
    private readonly errorHandler: SystemErrorHandler;

    get mainLoggerInstance() {
        return this.mainLogger;
    }

    get debugLoggerInstance() {
        return this.debugLogger;
    }
    
    get errorHandlerInstance() {
        return this.errorHandler;
    }

    constructor() {

        // 「自分が何番目の作業員か」を確認する。
        const workerIndex = process.env.TEST_WORKER_INDEX ;
    
        const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
        const workerTag = (workerIndex ?? '0').toString(); // Playwrightが未設定のときは0扱いにする
        const mainLogger = new TestLogger("./logs", `System.worker-${workerTag}.log`, logLevel);
        const mainDebugLogger = new TestLogger("./logs", `System.worker-${workerTag}.debug.log`, 'debug');
        const errorHandler = new SystemErrorHandler(mainLogger, mainDebugLogger);
    


        // デバッグ用のログファイルがない場合はメインのログファイルに書くようにしている
        //ただしメインログファイルはINFO以上しか書き込まないためDEBUGログは出力されない
        const debugLogger = mainDebugLogger ?? mainLogger;
        this.mainLogger = mainLogger;
        this.debugLogger = debugLogger;
        this.errorHandler = errorHandler;
    }

    createExecutionData() {
        
        /**
         * テストデータの初期化
         * JSONの情報からテストのシナリオと関数をそれぞれ配列にする
         * 
         * [
         *  [TestA, testB], 
         *  [TestA]
         * ] 
         * 
         * シナリオ内で複数のシステムを使う場合システムに対応したクラス名の配列が入る
         * シナリオ1　と　シナリオ2
         * 
         * [
         *  [
         *      ["open", "search"],  TestAで使う関数の配列
         *      ["open"]　　　　　　　testBで使う関数の配列
         *  ],
         *  [
         *      ["open","search"]    TestAで使う関数の配列
         *  ]
         * ]
         */
        const { scenarioList, functionList } = this.testDataList();


        // 実行フェーズだけで開始ログを出す
        this.startLog(scenarioList, functionList);
        

        /**
         * DTOリストの作成
         * [
         *  [  シナリオ1　の配列
         *    dto[TestA,open,search,..],　システム1つ目の内容
         *    dto[testB,open,...]　　　　　　システム2つ目の内容
         *  ],
         *  [　シナリオ2　の配列
         *   dto[TestA,open,search,....]　　　システム1つ目の内容
         *  ]
         * ]
         */
        const dtoList: RunScenarioGroupDto[] = this.createDtoList(scenarioList, functionList);

        //DTOリストの返却
        return { dtoList };

    }

    // テストデータの初期化
    //JSONの情報からテストのシナリオと関数をそれぞれ配列にする
    testDataList() {
        const scenarioList: string[][] = testContentsListFactory();
        const functionList: ScenarioFunctionList[] = testFunctionListFactory();
        return { scenarioList, functionList };
    }

    // 実行フェーズだけで開始ログを出す
    startLog(scenarioList: string[][], functionList: ScenarioFunctionList[]) {

        //全体のシナリオ数と会員数を取得する
        //ログ表示用
        const totalScenarios = scenarioList.length;
        const totalMembers = userDataList.reduce((sum, users) => sum + ((users && Array.isArray(users)) ? users.length : 0), 0);

        
        // 実行フェーズだけで開始ログを出す（テスト収集フェーズでは出さない）
        test.beforeAll(() => {
            if (this.mainLogger) {
                this.mainLogger.info(`=====================================`);
                this.mainLogger.info(`${new Date()} テスト実行を開始します`);
                this.mainLogger.info(`総シナリオ数=${totalScenarios} 総メンバー数=${totalMembers}`);
                // シナリオ・関数リストはデバッグ用途
                this.debugLogger.debug(`シナリオリスト: ${JSON.stringify(scenarioList)}`);
                this.debugLogger.debug(`関数リスト: ${JSON.stringify(functionList)}`);
            }
        });
    }

    //DTOリストの作成
    createDtoList(scenarioList: string[][], functionList: ScenarioFunctionList[]) {
        return scenarioList.map((testScenario, scenarioIndex) => {
            const myFunctionList = functionList[scenarioIndex];

            // Strategy生成
            const testList: TestStrategy[] = createStrategies(testScenario);
            
            // DTO生成
            return runScenarioGroupDtoFactory({
                testList,
                scenarioIndex,
                myFunctionList,
                mainLogger: this.mainLogger,
                debugLogger: this.debugLogger
            }); 
        });
    }
}