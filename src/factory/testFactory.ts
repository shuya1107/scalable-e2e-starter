import type { TestStrategy } from "../typeList";
import { strategyRecord } from "../strategiesConfig/strategyRecord";
import { CreateStrategiesError } from "../error/errorIndex";



//　テストをしたいシナリオの配列を受け取りインスタンス化をする関数
export function createStrategies(scenarioList: string[]): TestStrategy[] {

    try {
        const instances: TestStrategy[] = [];

        scenarioList.forEach((key) => {

            const StrategyClass = strategyRecord[key];

            // バリデーション: strategyRecordに該当するクラスが存在するかチェック
            if (!StrategyClass) {
                throw new CreateStrategiesError(
                    `JSON内の値 '${key}' に対応するテストクラスがレコードに存在しません。strategyRecordを確認してください。`,
                    'validation'
                );
            }

            // インスタンス化してリストに追加
            instances.push(new StrategyClass());

        });

        // 完成した配列を返す
        return instances;

    } catch (error) {
        // 既にCreateStrategiesErrorの場合はそのまま投げる
        if (error instanceof CreateStrategiesError) {
            throw error;
        }

        // その他の予期しないエラー
        const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : JSON.stringify(error);

        throw new CreateStrategiesError(
            `テストクラスのインスタンス化中に予期しないエラーが発生しました: ${errorMessage}`,
            'unknown',
            error
        );
    }
}