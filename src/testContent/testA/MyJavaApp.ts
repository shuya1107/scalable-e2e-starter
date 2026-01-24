import type { TestStrategy, TestExecutionContext } from '../../typeList/index';
import { testAactions } from './function/functionStrategiesConfig';
import { TestLogger } from '../../utils/TestLogger';

export class MyJavaApp implements TestStrategy {
  
    stepName = '自作アプリ';

    async execute(context: TestExecutionContext): Promise<boolean> {
        
        //@strategyIndex はテストのシナリオが入っている配列のインデックス番号
        const index = context.strategyIndex || 0;
        //　ログファイルを作成　システム名_シナリオ手順番号.log で保存される
        const logger = new TestLogger(context.testInfo.outputDir, `${this.stepName}_${index}.log`);
        logger.log(`[開始] シナリオ: ${this.stepName} を開始します`);


        // 現在実行中のアクション名を保持する変数(ログ出力用)
        let currentActionName: string | undefined;

        try {
            
            // このMyJavaAppインスタンスに対応する関数リストだけを取得
            const myFunctions = context.functions[index];
            
            for (const functionName of myFunctions) {
            const actionName = functionName as string;
            currentActionName = actionName;

                // 関数を取り出す
                const actionFunction = testAactions[actionName];

                // 関数が見つからなかったらエラー
                if (!actionFunction) {
                    // actionName が undefined の場合もあるのでケア
                    throw new Error(`未定義のアクションです: '${actionName}' は登録されていません。`);
                }

                const ok = await actionFunction(context.page, context.data, logger);

                // アクションが false を返したらテストを失敗にする
                if (!ok) {
                    throw new Error(`${actionName} が失敗しました`);
                }
            }


            return true;

        } catch (e) {
            logger.logError(e, `step=${index} action=${currentActionName ?? ''}`);
            console.error(e);
            return false;
        }
    }
}