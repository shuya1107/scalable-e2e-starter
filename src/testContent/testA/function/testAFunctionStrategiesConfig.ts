import type { ActionFnMap, TestAFunction } from '../../../typeList';
import { open } from './open';
import { search } from './search';



// 文字列をキーにして、実行する関数を値に持つレコード
export const testAactions: ActionFnMap<TestAFunction> = {
    open: open,
    search: search
};
