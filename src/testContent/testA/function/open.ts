import { ActionFn } from '../../functionType';

export const open: ActionFn = async (page, data) => {
    console.log("何かしらの処理を追加して");
    return true; // 成功したらtrue
};