import { Page, expect } from '@playwright/test';
import { TestStrategy } from '../strategiesConfig/TestStrategy';

export class MyJavaApp implements TestStrategy {
  
    stepName = '自作アプリ（Google検索）';

    async execute(page: Page, data: any): Promise<boolean> {
        console.log(`[${this.stepName}] 開始`);
        try {
            // 1. Googleを開く
            await page.goto('https://www.google.com/');

            // 2. 検索ボックスを見つけて入力を待つ（name="q" はGoogleの検索窓の不変のIDです）
            const searchBox = page.locator('textarea[name="q"]');
            await searchBox.click();
            await searchBox.fill('Playwright test video');

            // 3. エンターキーを押す
            await page.keyboard.press('Enter');

            // 5. 【重要】動画映えのために、わざと3秒待つ！
            // （本来のテストでは推奨されませんが、動画確認のために入れます）
            await page.waitForTimeout(3000);

            // 成功
            console.log(`[${this.stepName}] 検索完了`);
            return true;

        } catch (e) {
            console.error(e);
            return false;
        }
    }
}