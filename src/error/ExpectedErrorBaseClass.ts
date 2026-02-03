// 想定内の業務エラーを表すクラス
// テストを実行している最中のエラーパターン用であり、
// 失敗を意味するものではない
export class ExpectedErrorBaseClass extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExpectedErrorBaseClass';
        // TypeScriptでカスタムエラーを拡張する際のおまじない（プロトタイプチェーンの修正）
        Object.setPrototypeOf(this, ExpectedErrorBaseClass.prototype);
    }
}