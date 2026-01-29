import type { ActionFn } from '../../../typeList';

const functionName = "open";

export const open: ActionFn = async (page, data, logger) => {
    logger.log(`${functionName}開始`);
    
    console.log("ログイン処理について");
        
    logger.log(`${functionName}成功`);
};