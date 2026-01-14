import { TestStrategy } from "../strategiesConfig/TestStrategy";
import { strategyRecord } from "../strategiesConfig/strategyRecord";

type TestDataList = Record<string, string>[];

export function createStrategies(scenarioList: TestDataList): TestStrategy[] {
  
    const instances: TestStrategy[] = [];


    // 1. JSON配列（[ {"test1": "MyJavaApp"} ]）を回す
    scenarioList.forEach((dataObj) => {

        // 2. オブジェクトの値（"MyJavaApp" など）だけを取り出す
        // キー名 "test1" などは無視される
        const keys = Object.values(dataObj);

        keys.forEach((key) => {
        
            // レコードからクラスを取得
            // JSONは型推論で string とは限らない判定をされることがあるので、as string で明示
            const StrategyClass = strategyRecord[key];

            if (!StrategyClass) {
                throw new Error(`エラー: JSON内の値 '${key}' に対応するクラスがレコードにありません。`);
            }

            // 3. インスタンス化してリストに追加
            instances.push(new StrategyClass());
        });

    });

  // 4. 完成した配列を返す
  return instances;
}