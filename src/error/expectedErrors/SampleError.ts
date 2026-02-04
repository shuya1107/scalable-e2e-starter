import { ExpectedErrorBaseClass } from '../ExpectedErrorBaseClass';

export class SampleError extends ExpectedErrorBaseClass {

    public readonly allowedStatus = 'sample';

    constructor(
        message: string,
    ) {
        super(message);
        this.name = 'SampleError';
        // TypeScriptでカスタムエラーを拡張する際のおまじない（プロトタイプチェーンの修正）
        Object.setPrototypeOf(this, SampleError.prototype);
    }
}
