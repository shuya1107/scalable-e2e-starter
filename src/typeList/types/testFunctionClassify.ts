import { ActionFn } from "./functionTypes";

// TestA用の関数型定義
export type TestAFunction = ActionFn & { _tag: 'TestA' };

// A/Bテストの関数を分類するための型定義
export type A_B_TestingFunction = ActionFn & { _tag: 'A_B_Testing' };



