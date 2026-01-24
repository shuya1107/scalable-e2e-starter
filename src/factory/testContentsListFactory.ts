import testContent from '../../testdata/testContent.json';
import type { ScenarioStep } from '../typeList';
import { TestContentsListFactoryError } from '../error/index';


export function testContentsListFactory(): ScenarioStep[] {

    try {
        const testScenarios = testContent;

        // データ検証: testContentが配列かチェック
        if (!Array.isArray(testScenarios)) {
            throw new TestContentsListFactoryError(
                'testContent.json のデータ構造が不正です。配列である必要があります。',
                'validation'
            );
        }

        const scenarioList: ScenarioStep[] = [];  // テストの手順を入れる用

        for (const group of testScenarios) {

            // データ検証: groupが配列かチェック
            if (!Array.isArray(group)) {
                throw new TestContentsListFactoryError(
                    'testContent.json の各グループは配列である必要があります。',
                    'validation'
                );
            }

            const tests: string[] = [];
            
            for (const step of group) {
                //ここでstepはこれ
                //{ "test": "MyJavaApp", "scenario": {...} }
                
                // データ検証: stepにtestプロパティがあるかチェック
                if (!step.test || typeof step.test !== 'string') {
                    throw new TestContentsListFactoryError(
                        'testContent.json の各stepには "test" プロパティ（文字列）が必要です。',
                        'validation'
                    );
                }

                const scenario = step.test;
                tests.push(scenario);

            }

            //[
            //    1つ目のテスト（グループ）の配列（１ループ目でできる）
            //   [ "MyJavaApp", "MyJavaApp" ], 
            
            //    2つ目のテスト（グループ）の配列（２ループ目でできる）
            //   [ "MyJavaApp" ]
            // ]
            //こんな感じの配列　テストケース一つで配列が1つ中にできる想定
            scenarioList.push(tests);
        }

        return scenarioList;

    } catch (error) {
        // 既にTestContentsListFactoryErrorの場合はそのまま投げる
        if (error instanceof TestContentsListFactoryError) {
            throw error;
        }

        // SyntaxErrorの場合はJSONパースエラー（importなので通常起こらない）
        if (error instanceof SyntaxError) {
            throw new TestContentsListFactoryError(
                'testContent.json のパースに失敗しました。JSON形式を確認してください。',
                'parse',
                error
            );
        }

        // その他の予期しないエラー
        throw new TestContentsListFactoryError(
            `テストシナリオの初期化中に予期しないエラーが発生しました: ${error}`,
            'unknown',
            error
        );

    }
    
}
    