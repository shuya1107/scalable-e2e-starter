import testContent from '../../../testdata/testContent.json';
import { TestDetailsListFactoryError } from '../../error/systemErrorIndex';

/**
 * テスト名と説明だけのリストを作成する
 * 戻り値: [ ["testSampleA", "説明A"], ["testSampleB", "説明B"] ]
 */
export function testDetailsListFactory(): string[][] {

    try {
        const testScenarios = testContent;

        // 配列チェック
        if (!Array.isArray(testScenarios)) {
            throw new TestDetailsListFactoryError(
                'testContent.json が配列ではありません。',
                'validation'
            );
        }

        const detailsList: string[][] = [];

        for (const group of testScenarios) {
            
            // シンプルに「名前」と「説明」を取り出すだけ
            const name = group.testName || "";       // なければ空文字
            const desc = group.description || "";    // なければ空文字

            // [ "名前", "説明" ] の形にして追加
            detailsList.push([name, desc]);
        }

        return detailsList;

    } catch (error) {
        if (error instanceof TestDetailsListFactoryError) throw error;
        throw new TestDetailsListFactoryError(`エラー: ${error}`, 'unknown', error);
    }
}