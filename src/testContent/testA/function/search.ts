import type { ActionFn } from '../../../typeList';

const functionName = "search";

export const search: ActionFn = async (page, data, logger) => {
    logger.log(`${functionName}開始`);

    console.log("検索処理について");

    throw new Error("検索処理でエラーが発生しました");

    logger.log(`${functionName}成功`);
};