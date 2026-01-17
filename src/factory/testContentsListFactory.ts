import testContent from '../../testdata/testContent.json';


export function testContentsListFactory() {

    const testScenarios = testContent;

    const scenarioList = [];  // テストの手順を入れる用

    for (const group of testScenarios) {

        const tests: string[] = [];
        
        for (const step of group) {
            //ここでstepはこれ
            //{ "test1": "MyJavaApp", "scenario": {...} }
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

    return scenarioList
    
}
    