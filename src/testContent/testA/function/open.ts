import type { ActionFn } from '../../../typeList';

const functionName = "open";

export const open: ActionFn = async (page, data, logger) => {
    logger.log(`${functionName}開始`);
    try {
        console.log("ログイン処理について");
        
        logger.log(`${functionName}成功`);
        // 成功
        return true; 

    } catch (e) {
        // 失敗した時のログもここで出せると親切
        logger.log(`${functionName} でエラー: ${e}`);
        return false;
    }
};