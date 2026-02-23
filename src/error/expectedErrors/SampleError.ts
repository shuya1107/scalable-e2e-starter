import { ExpectedErrorBaseClass } from '../ExpectedErrorBaseClass';

export class SampleError extends ExpectedErrorBaseClass {

    constructor(
        message: string,
    ) {
        /**
         * sampleエラーは、ユーザーステータス "sample" のときに発生する想定内エラー
         */
        super(message, 'sample');
        this.name = 'SampleError';
        // TypeScriptでカスタムエラーを拡張する際のおまじない（プロトタイプチェーンの修正）
        Object.setPrototypeOf(this, SampleError.prototype);
    }
}
