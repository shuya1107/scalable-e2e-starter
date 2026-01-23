import testContent from '../../testdata/testContent.json';
import type { ScenarioFunctionList } from '../typeList';


export function testFunctinListFactory(): ScenarioFunctionList[] {

    const testScenarios = testContent;

    const functionList: ScenarioFunctionList[] = [];  // テストの関数の手順を入れる用

    for (const group of testScenarios) {
        // ここで group はこれ
        // [ { "test1": "MyJavaApp", "scenario": {...} }, { "test2":... } ]
        //JSONの配列一つを取り出す

        const scenarios: ScenarioFunctionList = [];
        
        for (const step of group) {

            const functionSc = step.scenario;
            // オブジェクトの「値」だけを抜き出して、配列にする
            // 結果: ["open", "search"]
            const values = Object.values(functionSc);

            scenarios.push(values);

        }

        // [
        //    1つ目のグループ（データも2つ分入る）
        //   [ 
        //     ["open", "search"], // 1個目のデータの値(1ループ目)
        //     ["open"]            // 2個目のデータの値(2ループ目)
        //   ],

        //    2つ目のグループ（データは1つ分）
        //   [ 
        //     ["open", "search"] 
        //   ]
        // ]
        //こんな感じの配列　テストケース一つで配列が1つ中にできる想定
        functionList.push(scenarios);
    }

    return functionList
}
    