import { expect } from '@playwright/test';
import type { A_B_TestingFunction } from '../../../../typeList';

const functionName = "transition";

export const transition = (async (page, data, logger) => {
    
    logger.log(`${functionName}開始`);
    
    await page.getByRole('link', { name: 'A/B Testing' }).click();
        
    // 3000ミリ秒 ＝ 3秒間、画面を止めて待機する
    await page.waitForTimeout(3000);

    
    try {
        const expectedTexts = ['A/B Test Control', 'A/B Test Variation 1'];
        const actualText = await page.locator('h3').textContent();
        expect(expectedTexts).toContain(actualText);
    } catch (error) {
        logger.log(`${functionName}失敗: ${error}`);
    }

    logger.log(`${functionName}成功`);

}) as A_B_TestingFunction;