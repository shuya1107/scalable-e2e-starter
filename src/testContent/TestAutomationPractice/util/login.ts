import { Page, expect } from "@playwright/test";
import { UrlEnum } from "../../../utils/UrlEnum";
import { LoginError } from "../../../error/systemErrorIndex";

/**
 * テスト自動化の練習用サイトにログインするための共通の関数
 */

export async function login(page: Page): Promise<void> {

    // ログインページに遷移
    await page.goto(UrlEnum.Practice);

    // ログインできたのかチェック
    try {
        await expect(page.locator('h1')).toHaveText('Welcome to the-internet');
    }catch (e) {
        throw new LoginError('ログインに失敗しました。ページのタイトルが期待値と異なります。');
    }

}