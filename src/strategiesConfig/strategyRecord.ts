import { TestA } from "../testContent/testA/TestA";
import type { TestStrategyRecord } from "../typeList/index";

export const strategyRecord: TestStrategyRecord = {
    'TestA': TestA
    
    // ↓ TestStrategyを実装してないクラスを入れるとここで赤線エラーになる
    // 'error': String 
};