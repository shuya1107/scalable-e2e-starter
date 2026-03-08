import { TestA } from "../testContent/testA/TestA";
import { A_B_testing } from "../testContent/TestAutomationPractice/A_B_Testing/A_B_Testing";
import type { TestStrategyRecord } from "../typeList/index";

export const strategyRecord: TestStrategyRecord = {
    'TestA': TestA,
    'A_B_Testing': A_B_testing
    
    // ↓ TestStrategyを実装してないクラスを入れるとここで赤線エラーになる
    // 'error': String 
};