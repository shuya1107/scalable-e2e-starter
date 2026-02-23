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
import { testFunctionListFactory, createStrategies, testContentsListFactory, testDetailsListFactory } from '../factory/factoryIndex';

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
         * JSONの情報からテストのシナリオ・関数・テスト詳細を配列にする
         *
         * シナリオ配列（クラス名）
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
         *      ["open", "search"]   TestAで使う関数の配列
         *  ]
         * ]
         *
         * テスト詳細配列（テスト名と説明）
         * [
         *  ["testSampleA", "説明"],
         *  ["testSampleB", "説明"]
         * ]
         */
        const { scenarioList, functionList, detailsList } = this.testDataList();


        // 実行フェーズだけで開始ログを出す
        this.startLog(scenarioList, functionList);
        

        /**
         * DTOリストの作成（実行時の形）
         *
         * testContent.json が今の内容の場合、dtoList はこうなる:
         * [
         *  {
         *    testName: "testSampleA(このテストシナリオの名前)",
         *    description: "このテストの説明",
         *    scenarioIndex: 0,
         *    contents: [
         *      {
         *        testList: [TestA, TestA],
         *        myFunctionList: [["open", "search"], ["open"]],
         *        mainLogger: TestLogger,
         *        debugLogger: TestLogger
         *      }
         *    ]
         *  },
         *  {
         *    testName: "testSampleB(このテストシナリオの名前)",
         *    description: "このテストの説明",
         *    scenarioIndex: 1,
         *    contents: [
         *      {
         *        testList: [TestA],
         *        myFunctionList: [["open", "search"]],
         *        mainLogger: TestLogger,
         *        debugLogger: TestLogger
         *      }
         *    ]
         *  }
         * ]
         */
        const dtoList: RunScenarioGroupDto[] = this.createDtoList(scenarioList, functionList,detailsList);

        //DTOリストの返却
        return { dtoList };

    }

    // テストデータの初期化
    //JSONの情報からテストのシナリオ・関数・テスト詳細を配列にする
    testDataList() {
        const scenarioList: string[][] = testContentsListFactory();
        const functionList: ScenarioFunctionList[] = testFunctionListFactory();
        const detailsList: string[][] = testDetailsListFactory();
        //後でここのstring[][]の部分をDTOに変更する
        return { scenarioList, functionList, detailsList };
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

    // DTOリストの作成
    createDtoList(scenarioList: string[][], functionList: ScenarioFunctionList[], detailsList: string[][]) {
        
        return scenarioList.map((testScenario, scenarioIndex) => {
            
            const myFunctionList = functionList[scenarioIndex];
            const myDetails = detailsList[scenarioIndex]; 

            // 1. 名前と説明を取り出す
            const testName = myDetails[0];
            const description = myDetails[1];

            // Strategy生成
            const testList: TestStrategy[] = createStrategies(testScenario);
            
            // DTO生成
            return runScenarioGroupDtoFactory({
                // ★ここに追加するだけでOK！
                // (ファクトリーが中で contents 配列に包んでくれます)
                testName: testName,
                description: description,
                
                testList: testList,
                scenarioIndex: scenarioIndex,
                myFunctionList: myFunctionList,
                mainLogger: this.mainLogger,
                debugLogger: this.debugLogger,
            }); 
        });
    }
}