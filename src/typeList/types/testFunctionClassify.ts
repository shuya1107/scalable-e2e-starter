import { ActionFn } from "./functionTypes";

// TestA用の関数型定義
export type TestAFunction = ActionFn & { _tag: 'TestA' };

