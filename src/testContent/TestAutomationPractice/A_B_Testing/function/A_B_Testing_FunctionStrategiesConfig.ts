import type { ActionFnMap, A_B_TestingFunction } from '../../../../typeList';
import { transitionWithCookie } from './transitionWithCookie';
import { transition } from './transition';


// 文字列をキーにして、実行する関数を値に持つレコード
export const A_B_Function: ActionFnMap<A_B_TestingFunction> = {
    //　期待値が二つの見出しをOKとするパターンの関数
    'transition': transition,
    // クッキーを入れて特定の見出しを表示させるパターンの関数
    'transitionWithCookie':transitionWithCookie
};