import { Page } from '@playwright/test';

// 関数（アクション）に関する型定義

// 1つの細かい処理（関数）の型
export type ActionFn = (page: Page, data: import('./userType').User, logger: import('../../utils/TestLogger').TestLogger) => Promise<void>;

// 関数名をキーとして ActionFn を値に持つレコード型
export type ActionFnMap = Record<string, ActionFn>;

// テストで使う関数名の配列（例: ["open", "search"]）
export type FunctionNameList = string[];

// 1つのシナリオグループで使う関数リスト（例: [["open", "search"], ["open"]]）
export type ScenarioFunctionList = FunctionNameList[];
