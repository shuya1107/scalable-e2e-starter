import { TestReport } from "../../report/TestReport";
import type { User } from "../../typeList";

export function testReportFactory(data: User): TestReport {
    // レポートクラスのインスタンスを生成して返す
    return new TestReport(data);
}