import { ExpectedErrorBaseClass } from '../ExpectedErrorBaseClass';

export class LoginError extends ExpectedErrorBaseClass {

    constructor(
        message: string,
    ) {
        /**
         * loginエラーは、ユーザーステータス "login" のときに発生する想定内エラー
         */
        super(message, 'login');
        this.name = 'LoginError';
        // TypeScriptでカスタムエラーを拡張する際のおまじない（プロトタイプチェーンの修正）
        Object.setPrototypeOf(this, LoginError.prototype);
    }
}
