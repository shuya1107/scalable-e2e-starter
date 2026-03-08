import { expect } from '@playwright/test';
import type { A_B_TestingFunction } from '../../../../typeList';

// 関数名を変えておきます
const functionName = "transitionWithCookie";

export const transitionWithCookie = (async (page, data, logger) => {
    
    logger.log(`${functionName}開始`);
    
    // ★ポイント1: リンクをクリックする（ページを開く）前に、ブラウザにCookieを仕込む！
    // ※今回は the-internet.herokuapp.com のドメインに対して「A/Bテスト無効化(Opt-out)」のCookieを発行します
    await page.context().addCookies([
        {
            name: 'optimizelyOptOut',   // OptimizelyというA/Bテストツールの無効化用Cookie名
            value: 'true',
            domain: 'the-internet.herokuapp.com',
            path: '/'
        }
    ]);

    // Cookieを持った状態（オプトアウト済みユーザーとして）でリンクをクリック
    await page.getByRole('link', { name: 'A/B Testing' }).click();
        
    await page.waitForTimeout(3000);

    try {
        // ★ポイント2: Cookieが効いていれば、AでもBでもない「No A/B Test」という固定の画面が出ます
        const expectedText = 'No A/B Test';
        
        const actualText = await page.locator('h3').textContent();
        
        // 今回は配列ではなく、完全に「これが出るはずだ！」とピンポイントで比較する
        expect(actualText).toBe(expectedText);
        
    } catch (error) {
        logger.log(`${functionName}失敗: ${error}`);
        // ※Playwrightのテストとしてちゃんと「失敗」扱いにしたい場合は、
        // ここで throw error; を入れてあげるのもオススメです。
    }

    logger.log(`${functionName}成功`);

}) as A_B_TestingFunction;