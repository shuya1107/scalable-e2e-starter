import { test } from '@playwright/test';

// エラーハンドリング用の関数
//後でクラス化したほうがいいと思われる
import { errorHandleFactory } from '../error/errorHandler/errorHandler';

// サービスのファクトリ関数
import { runScenarioGroupServiceFactory, runServiceFactory, runUserTestServiceFactory } from '../service/factory/serviceFactoryIndex';

// DTOの型定義
import { RunUserTestDto } from '../dto/dtoIndex';


/**
 * run関数のしたいこと
 * 
 * @dtoList - RunScenarioGroupDtoの配列（シナリオグループごとに1つのDTO）
 * [
 *   // シナリオグループ1
 *   RunScenarioGroupDto {
 *     testList: [MyJavaAppインスタンス, MyJavaAppインスタンス],  // 2つのテスト手順
 *     scenarioIndex: 0,
 *     myFunctionList: [["open", "search"], ["open"]],  // 各テストで使う関数リスト
 *     mainLogger: TestLogger,
 *     debugLogger: TestLogger
 *   },
 * 
 *   // シナリオグループ2
 *   RunScenarioGroupDto {
 *     testList: [MyJavaAppインスタンス],  // 1つのテスト手順
 *     scenarioIndex: 1,
 *     myFunctionList: [["open", "search"]],
 *     mainLogger: TestLogger,
 *     debugLogger: TestLogger
 *   }
 * ]
 * 
 * この配列を作成し、各シナリオグループを順番に実行する
 * 
 * @runScenarioGroupDto - 1つのシナリオグループのDTO
 * RunScenarioGroupDto {
 *   testList: [MyJavaAppインスタンス, MyJavaAppインスタンス],
 *   scenarioIndex: 0,
 *   myFunctionList: [["open", "search"], ["open"]],
 *   mainLogger: TestLogger,
 *   debugLogger: TestLogger
 * }
 * 
 * これを次の関数runScenarioGroupに渡す
 * for of でシナリオの数だけループする（この例では2回）
 */
export function run() {

    const runService = runServiceFactory();

    try{

        const { dtoList } = runService.createExecutionData();

        // DTOの配列（シナリオの数ループする）
        for (const runScenarioGroupDto of dtoList) {

            //シナリオの数だけサービスを作成（ループの数）
            const runScenarioGroupService = runScenarioGroupServiceFactory(runScenarioGroupDto);
        
            runScenarioGroup(
                runScenarioGroupService
            );

        }
    } catch (error) {

        // エラーハンドリング用の関数
        errorHandleFactory(error, runService.mainLoggerInstance, runService.debugLoggerInstance);
    }
    
}


/**
 * runScenarioGroup関数のしたいこと
 * @runUserDto
 * [
 *   // 1人目 (M009)
 *   RunUserTestDto {
 *     data: { memberCode: "M009", key: "LOGIN_STANDARD", status: "active" },
 *     testList: [MyJavaAppインスタンス, MyJavaAppインスタンス],  // ["MyJavaApp", "MyJavaApp"]から生成
 *     myFunctionList: [["open", "search"], ["open"]]  // 各テストで実行する関数リスト
 *   },
 *   // 2人目 (M022)
 *   RunUserTestDto {
 *     data: { memberCode: "M022", key: "LOGIN_ERROR", status: "locked" },
 *     testList: [MyJavaAppインスタンス, MyJavaAppインスタンス],
 *     myFunctionList: [["open", "search"], ["open"]]
 *   },
 *   // 3人目 (M939)
 *   RunUserTestDto {
 *     data: { memberCode: "M939", key: "ADMIN_ACCESS", status: "admin" },
 *     testList: [MyJavaAppインスタンス, MyJavaAppインスタンス],
 *     myFunctionList: [["open", "search"], ["open"]]
 *   }
 * ]
 * 
 * 
 * この配列を作成する　ユーザーデータを配列に入れたかった
 * それを次の関数runUserTestに渡す
 * for of でユーザーの数だけループする（この例では3回）
 */
//関数の戻り値の型をこの引数の型とするという推論
export function runScenarioGroup(runScenarioGroupService: ReturnType<typeof runScenarioGroupServiceFactory>) {

    try {

        // レポートで見やすいように「グループ化」
        // シナリオで1人、一つのファイルにまとめて出してくれる
        test.describe(`Scenario Group ${runScenarioGroupService.scenarioIndex + 1}`, () => {

            const { runUserDto } = runScenarioGroupService.createScenarioGroup();

            for (const runUserTestDto of runUserDto) {
                //テストシナリオと会員の情報を渡す
                runUserTest(
                    runUserTestDto
                );
            }
            
        });
    } catch (error) {
        // 基本的に予期しないエラーのみ飛んでくる意味がないわけではないと思いたい使われないのが一番良い
        errorHandleFactory(error, runScenarioGroupService.mainLogger, runScenarioGroupService.debugLogger);
    }
}



//実際にテストを行う関数
export function runUserTest(runUserTestDto: RunUserTestDto) {

    // レポート用のタイトルに memberCodeを入れてわかりやすくする
    test(`Test - Member: ${runUserTestDto.data.memberCode} `, async ({ page }, testInfo) => {

        const runUserTestService = runUserTestServiceFactory(
            runUserTestDto,
            testInfo,
            page
        );

        await runUserTestService.runUserTestStart();

    });
}


