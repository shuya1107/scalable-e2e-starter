import testContent from '../../../testdata/testContent.json';
import type { ScenarioFunctionItem, ScenarioFunctionList } from '../../typeList';
import { TestFunctionListFactoryError } from '../../error/systemErrorIndex';


export function testFunctionListFactory(): ScenarioFunctionList[] {

    try {
        const testScenarios = testContent;

        // ■■■ 1. 最上位の検証 ■■■
        // データ検証: testContent自体が配列であることを保証 (例: [Group1, Group2, ...])
        if (!Array.isArray(testScenarios)) {
            throw new TestFunctionListFactoryError(
                'testContent.json のデータ構造が不正です。配列である必要があります。',
                'validation'
            );
        }

        // 最終的な戻り値を入れる箱
        // 構造: [ GroupAの関数リスト, GroupBの関数リスト, ... ]
        // 例: [ 
        //       [ ["open", "search"], ["login"] ],  // GroupA
        //       [ ["logout"] ]                      // GroupB
        //     ]
        const functionList: ScenarioFunctionList[] = [];

        // ■■■ 2. グループごとのループ処理 ■■■
        for (const group of testScenarios) {
            // group: 1つのシナリオグループ（testName/description/steps を持つ）
            // 例: { testName: "testSampleA", description: "...", steps: [ ... ] }

            // データ検証: group.steps が配列であることを保証
            if (!group.steps || !Array.isArray(group.steps)) {
                throw new TestFunctionListFactoryError(
                    'testContent.json の各グループには "steps" 配列が必要です。',
                    'validation'
                );
            }

            // グループ内の全ステップの関数リストを一時保存する配列
            // 例: [ ["open", "search"], ["login"] ]
            const scenarios: ScenarioFunctionList = [];
            
            // ■■■ 3. ステップごとのループ処理 ■■■
            for (const step of group.steps) {
                // step: テストクラス名とシナリオ配列を持つオブジェクト
                // 例: { test: "TestA", scenario: [ {func: "open"}, {func: "search"} ] }

                // ■■■ 変更箇所 1: 配列チェックに変更 ■■■
                // step.scenario が存在し、かつ「配列」であることを確認
                // これにより、後の map 処理が安全に行える
                if (!step.scenario || !Array.isArray(step.scenario)) {
                    throw new TestFunctionListFactoryError(
                        'testContent.json の各stepの "scenario" は配列である必要があります。',
                        'validation'
                    );
                }

                // ■■■ 変更箇所 2: mapを使って "func" を指定して抜き出す ■■■
                // 変換処理: オブジェクトの配列から、関数名の文字列配列へ変換する
                //
                // [Input]  step.scenario
                //    [ { "func": "open" }, { "func": "search" } ]
                //       ↓ map処理
                // [Output] values
                //    [ "open", "search" ]
                const values = step.scenario.map((item: ScenarioFunctionItem, index: number) => {
                    
                    // 1. func プロパティの存在と型チェック
                    // JSON内に "func" キーがない、または文字列でない場合はエラー
                    if (!item.func || typeof item.func !== 'string') {
                        throw new TestFunctionListFactoryError(
                            `scenarioの ${index + 1} 番目の要素に "func" プロパティがありません。`,
                            'validation'
                        );
                    }

                    // 2. 値（関数名）だけを取り出して新しい配列の要素にする
                    return item.func;
                });

                // 生成された関数名のリストを追加
                // scenariosの状態: [ ["open", "search"] ]
                scenarios.push(values);
            }

            // 完成したグループごとのリストを親配列に追加
            functionList.push(scenarios);
        }

        return functionList;
  
    } catch (error) {
        // 既にTestFunctionListFactoryErrorの場合はそのまま投げる（重複ラップを防ぐ）
        if (error instanceof TestFunctionListFactoryError) {
            throw error;
        }

        // SyntaxErrorの場合はJSONパースエラー（importなので通常起こらないが念のため）
        if (error instanceof SyntaxError) {
            throw new TestFunctionListFactoryError(
                'testContent.json のパースに失敗しました。JSON形式を確認してください。',
                'parse',
                error
            );
        }

        // その他の予期しないエラー（ここに来る場合は想定外のバグの可能性）
        throw new TestFunctionListFactoryError(
            `テストシナリオの初期化中に予期しないエラーが発生しました: ${error}`,
            'unknown',
            error
        );
    }
}