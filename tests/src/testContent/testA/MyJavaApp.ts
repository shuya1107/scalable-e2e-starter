import { Page, expect } from '@playwright/test';
import { TestStrategy } from '../../strategiesConfig/TestStrategy';
import testAScenario from '../../../testdata/testAScenario.json';
import { testAactions } from './function/functionStrategiesConfig';
import { user } from '../../testDataType/testDataType';

export class MyJavaApp implements TestStrategy {
  
    stepName = '自作アプリ（Google検索）';

    async execute(page: Page, data: user): Promise<boolean> {
        
        try {
            
            for (const task of testAScenario ) {
                const values = Object.values(task);
                const actionName = values[0] as string;

                // 関数を取り出す
                const actionFunction = testAactions[actionName];

                // 関数が見つからなかったらエラー
                if (!actionFunction) {
                     // actionName が undefined の場合もあるのでケア
                    throw new Error(`未定義のアクションです: '${actionName}' は登録されていません。`);
                }

                await actionFunction(page, data);
            }


            return true;

        } catch (e) {
            console.error(e);
            return false;
        }
    }
}