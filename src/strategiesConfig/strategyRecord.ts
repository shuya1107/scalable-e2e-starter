import { MyJavaApp } from "../testContent/testA/MyJavaApp";
import type { TestStrategyRecord } from "../typeList/index";

export const strategyRecord: TestStrategyRecord = {
    'MyJavaApp': MyJavaApp
    
    // ↓ TestStrategyを実装してないクラスを入れるとここで赤線エラーになる
    // 'error': String 
};