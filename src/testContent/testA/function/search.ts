import type { ActionFn } from '../../../typeList';

const functionName = "search";

export const search: ActionFn = async (page, data, logger) => {
    logger.log(`${functionName}開始`);
    try {
        console.log("検索処理について");

        // TODO: 実際の検索処理をここに実装する
        logger.log(`${functionName}成功`);
        // 成功として扱う
        return true; 

    } catch (e) {
        // 失敗した時のログもここで出せると親切
        logger.log(`${functionName} でエラー: ${e}`);
        return false;
    }
};