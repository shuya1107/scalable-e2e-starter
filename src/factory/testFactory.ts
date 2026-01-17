import { TestStrategy } from "../strategiesConfig/TestStrategy";
import { strategyRecord } from "../strategiesConfig/strategyRecord";

const instances: TestStrategy[] = [];

export function createStrategies(scenarioList: string[]): TestStrategy[] {


    scenarioList.forEach((key) => {

        const StrategyClass = strategyRecord[key];

            if (!StrategyClass) {
                throw new Error(`エラー: JSON内の値 '${key}' に対応するクラスがレコードにありません。`);
            }

            // 3. インスタンス化してリストに追加
            instances.push(new StrategyClass());

    });

  // 4. 完成した配列を返す
  return instances;
}