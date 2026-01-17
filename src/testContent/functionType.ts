import { Page } from '@playwright/test';
import { user } from '../testDataType/testDataType';

 // 1つの細かい処理（関数）の型
export type ActionFn = (page: Page, data: user) => Promise<boolean>;