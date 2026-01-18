import { Page } from '@playwright/test';
import { user } from '../testDataType/testDataType';
import { TestLogger } from '../utils/TestLogger';

 // 1つの細かい処理（関数）の型
export type ActionFn = (page: Page, data: user, logger: TestLogger) => Promise<boolean>;