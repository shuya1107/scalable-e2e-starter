import { MyJavaApp } from "../testContent/MyJavaApp";
import { TestStrategy } from "./TestStrategy";

export const strategyRecord: Record<string, { new(): TestStrategy }> = {
    'MyJavaApp': MyJavaApp
    
    // ↓ TestStrategyを実装してないクラスを入れるとここで赤線エラーになる
    // 'error': String 
};