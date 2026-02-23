import testContent from '../../../testdata/testContent.json';
import { TestContentsListFactoryError } from '../../error/systemErrorIndex';


export function testContentsListFactory(): string[][] {

    try {
        const testScenarios = testContent;

        // ■■■ 1. 最上位の検証 ■■■
        // データ検証: testContent自体が配列であることを保証
        if (!Array.isArray(testScenarios)) {
            throw new TestContentsListFactoryError(
                'testContent.json のデータ構造が不正です。配列である必要があります。',
                'validation'
            );
        }

        // 最終的な戻り値を入れる箱
        // 構造: [ ["TestA", "TestA"], ["TestB"] ] (テストクラス名の配列の配列)
        const scenarioList: string[][] = [];

        // ■■■ 2. グループごとのループ処理 ■■■
        for (const groupObj of testScenarios) {
            // groupObj: { groupName: string, steps: Array } 形式のオブジェクト

            // ■■■ 変更箇所: steps 配列の検証と取得 ■■■
            // groupObj の中に "steps" プロパティがあり、それが配列であることを確認
            if (!groupObj.steps || !Array.isArray(groupObj.steps)) {
                throw new TestContentsListFactoryError(
                    'testContent.json の各グループには "steps" 配列が必要です。',
                    'validation'
                );
            }

            const tests: string[] = [];      // 1グループ分のテストクラス名を貯める箱
            const steps = groupObj.steps;    // steps配列を取り出す
            
            // ■■■ 3. ステップごとのループ処理 ■■■
            for (const step of steps) {
                // step: { "test": "TestA", "scenario": [...] }

                // データ検証: stepに "test" プロパティ（クラス名）があるかチェック
                if (!step.test || typeof step.test !== 'string') {
                    throw new TestContentsListFactoryError(
                        'testContent.json の各stepには "test" プロパティ（文字列）が必要です。',
                        'validation'
                    );
                }

                const scenario = step.test;
                tests.push(scenario);
            }

            // 完成したグループごとのクラス名リストを追加
            // 例: [ "TestA", "TestA" ]
            scenarioList.push(tests);
        }

        return scenarioList;

    } catch (error) {
        // 既にTestContentsListFactoryErrorの場合はそのまま投げる
        if (error instanceof TestContentsListFactoryError) {
            throw error;
        }

        // SyntaxErrorの場合はJSONパースエラー
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