import { test } from '@playwright/test';

// テストデータのインポート
import userDataList from '../../testdata/users.json';

// ログ出力用のクラスと関数
import { TestLogger } from '../utils/TestLogger';

// 型定義
import type { ScenarioFunctionList, TestStrategy } from '../typeList/index';

// DTOファクトリー関数
import { runScenarioGroupDtoFactory } from '../dto/dtoFactoryIndex';

// DTOの型定義
import { RunScenarioGroupDto } from '../dto/dtoIndex';

// ファクトリー関数
import { testFunctionListFactory, createStrategies, testContentsListFactory } from '../factory/factoryIndex';


export class RunService {

    static createExecutionData(mainLogger: TestLogger, debugLogger: TestLogger) {
        
        // テストデータの初期化
        //JSONの情報からテストのシナリオと関数をそれぞれ配列にする
        const { scenarioList, functionList } = this.testDataList();


        // 実行フェーズだけで開始ログを出す
        this.startLog(mainLogger, scenarioList, functionList);
        
        //DTOリストの作成
        const dtoList: RunScenarioGroupDto[] = this.createDtoList(scenarioList, functionList, mainLogger, debugLogger);

        //DTOリストの返却
        return { dtoList };

    }

    // テストデータの初期化
    //JSONの情報からテストのシナリオと関数をそれぞれ配列にする
    static testDataList() {
        const scenarioList: string[][] = testContentsListFactory();
        const functionList: ScenarioFunctionList[] = testFunctionListFactory();
        return { scenarioList, functionList };
    }

    // 実行フェーズだけで開始ログを出す
    static startLog(mainLogger: TestLogger, scenarioList: string[][], functionList: ScenarioFunctionList[]) {

        //全体のシナリオ数と会員数を取得する
        //ログ表示用
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
    }

    //DTOリストの作成
    static createDtoList(scenarioList: string[][], functionList: ScenarioFunctionList[], mainLogger: TestLogger, debugLogger: TestLogger) {
        return scenarioList.map((testScenario, scenarioIndex) => {
            const myFunctionList = functionList[scenarioIndex];

            // Strategy生成
            const testList: TestStrategy[] = createStrategies(testScenario);
            
            // DTO生成
            return runScenarioGroupDtoFactory({
                testList,
                scenarioIndex,
                myFunctionList,
                mainLogger,
                debugLogger
            }); 
        });
    }
}