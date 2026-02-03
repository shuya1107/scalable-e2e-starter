import testContent from '../../../testdata/testContent.json';
import type { ScenarioFunctionList } from '../../typeList';
import { TestFunctionListFactoryError } from '../../error/systemErrorIndex';


export function testFunctionListFactory(): ScenarioFunctionList[] {

    try {
        const testScenarios = testContent;

        // データ検証: testContentが配列かチェック
        if (!Array.isArray(testScenarios)) {
            throw new TestFunctionListFactoryError(
                'testContent.json のデータ構造が不正です。配列である必要があります。',
                'validation'
            );
        }

        const functionList: ScenarioFunctionList[] = [];  // テストの関数の手順を入れる用

        for (const group of testScenarios) {
            // ここで group はこれ
            // [ { "test1": "TestA", "scenario": {...} }, { "test2":... } ]
            //JSONの配列一つを取り出す

            // データ検証: groupが配列かチェック
            if (!Array.isArray(group)) {
                throw new TestFunctionListFactoryError(
                    'testContent.json の各グループは配列である必要があります。',
                    'validation'
                );
            }

            const scenarios: ScenarioFunctionList = [];
            
            for (const step of group) {

                // データ検証: stepにscenarioプロパティがあるかチェック
                if (!step.scenario || typeof step.scenario !== 'object') {
                    throw new TestFunctionListFactoryError(
                        'testContent.json の各stepには "scenario" プロパティ（オブジェクト）が必要です。',
                        'validation'
                    );
                }

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

        return functionList;
  
    } catch (error) {
        // 既にTestFunctionListFactoryErrorの場合はそのまま投げる
        if (error instanceof TestFunctionListFactoryError) {
            throw error;
        }

        // SyntaxErrorの場合はJSONパースエラー（importなので通常起こらない）
        if (error instanceof SyntaxError) {
            throw new TestFunctionListFactoryError(
                'testContent.json のパースに失敗しました。JSON形式を確認してください。',
                'parse',
                error
            );
        }

        // その他の予期しないエラー
        throw new TestFunctionListFactoryError(
            `テストシナリオの初期化中に予期しないエラーが発生しました: ${error}`,
            'unknown',
            error
        );
    }
}
    