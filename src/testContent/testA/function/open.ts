import type { TestAFunction } from '../../../typeList';

const functionName = "open";

export const open = (async (page, data, logger) => {
    logger.log(`${functionName}開始`);
    
    console.log("ログイン処理について");
        
    logger.log(`${functionName}成功`);
}) as TestAFunction;