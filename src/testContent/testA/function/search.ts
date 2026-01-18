import { ActionFn } from '../../functionType';

const functionName = "search";

export const search: ActionFn = async (page, data, logger) => {
    logger.log(`${functionName}開始`);
    try {
        console.log("何らかの処理を入れてね");
        
        logger.log(`${functionName}成功`);
        // 成功
        return true; 

    } catch (e) {
        // 失敗した時のログもここで出せると親切
        logger.log(`${functionName} でエラー: ${e}`);
        return false;
    }
};