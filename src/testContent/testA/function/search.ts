import type { TestAFunction } from '../../../typeList';

const functionName = "search";

export const search = (async (page, data, logger) => {
    logger.log(`${functionName}開始`);

    console.log("検索処理について");

    logger.log(`${functionName}成功`);

    // if (!false){
    //     throw new Error("searchでエラー発生");
    // }

    // ★処理全体を test.step で囲む
        
        logger.log(`${functionName}開始`);
        console.log("検索処理について");

        // Googleを開く
        await page.goto('https://www.google.co.jp');
        
        // 待機
        await page.waitForTimeout(3000);

        logger.log(`${functionName}成功`);

}) as TestAFunction;