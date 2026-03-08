import { login } from "../util/login";
import { TestLogger } from '../../../utils/TestLogger';
import { TestExecutionContext } from "../../../typeList";
import { A_B_Function } from "../../../testContent/TestAutomationPractice/A_B_Testing/function/A_B_Testing_FunctionStrategiesConfig";
import { A_B_TestingError } from "../../../error/errors/A_B_TestingError";

export class A_B_testing {

    stepName = 'A_B Testing';

    async execute(context: TestExecutionContext): Promise<void> {

        //@strategyIndex はテストのシナリオが入っている配列のインデックス番号
        const index = context.strategyIndex;
        //　ログファイルを作成　システム名_シナリオ手順番号.log で保存される
        const logger = new TestLogger(context.testInfo.outputDir, `${this.stepName}_${index}.log`);
        logger.log(`[開始] シナリオ: ${this.stepName} を開始します`);


        // 現在実行中のアクション名を保持する変数(ログ出力用)
        let currentActionName: string | undefined;

        try {

            // まずはログインしておく
            await login(context.page);
                    
            // このA_B_Testingインスタンスに対応する関数リストだけを取得
            const myFunctions = context.functions[index];
            
            for (const functionName of myFunctions) {
            const actionName = functionName as string;
            currentActionName = actionName;

                // 関数を取り出す
                const actionFunction = A_B_Function[actionName];

                // 関数が見つからなかったらエラー
                if (!actionFunction) {
                    // actionName が undefined の場合もあるのでケア
                    throw new A_B_TestingError(`未定義のアクションです: '${actionName}' は登録されていません。`, 'validation');
                }

                await actionFunction(context.page, context.data, logger);
            }

        } catch (e) {
            logger.logError(e, `step=${index} action=${currentActionName ?? ''}`);
            console.error(e);
            throw e;
        }
    }
}

