import { TestReport } from "../../report/TestReport";
import type { User } from "../../typeList";

// ★ 引数に testName と description を追加
export function testReportFactory(data: User, testName: string, description: string): TestReport {
    
    // レポートクラスに渡して生成
    return new TestReport(data, testName, description);
}