
//　エラークラスの親クラス
export abstract class BaseError extends Error {
    constructor(
        public message: string,
        public errorType: string, // エラーの種類を示す文字列
        public functionName: string, // どの関数で起きたか
        public originalError?: unknown // 元の原因 catchしたエラー
    ) {
        // 親クラスを初期化しないといけないから行う
        super(message);
        
        // ログに出た時に「Error」ではなく「実際のクラス名」が表示されるようにする
        this.name = this.constructor.name;
        
        // TypeScriptで instanceof が正しく動くようにするおまじない
        // (ターゲットがES5以下の古い環境でなければ不要ですが、あると安心です)
        Object.setPrototypeOf(this, new.target.prototype);
    }
}