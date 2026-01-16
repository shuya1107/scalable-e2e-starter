import { ActionFn } from '../../functionType';

export const open: ActionFn = async (page, data) => {
    await page.goto("何かしらの処理を追加して");
    return true; // 成功したらtrue
};