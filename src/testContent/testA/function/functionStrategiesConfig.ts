import { ActionFn } from '../../functionType';
import { open } from './open';
import { search } from './search';



// 文字列をキーにして、実行する関数を値に持つレコード
export const testAactions: Record<string, ActionFn> = {
    open: open,
    search: search
};
