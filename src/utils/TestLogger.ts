import * as fs from 'fs';
import * as path from 'path';

// ログの共通プレフィックスを生成するためのコンテキスト
export type LogContext = {
    scenarioIndex?: number;
    memberCode?: string;
    stepName?: string;
};

export function formatLogContext({ scenarioIndex, memberCode, stepName }: LogContext): string {
    const parts: string[] = [];
    if (scenarioIndex !== undefined) parts.push(`scenario=${scenarioIndex + 1}`); // 1始まりで人間に見せる
    if (memberCode) parts.push(`member=${memberCode}`);
    if (stepName) parts.push(`step=${stepName}`);
    //parts.join()で配列の間に何を挟むかを指定することができる
    //今回のは間に指定したうえで全体を[]で囲む形にしているためすべてを[]で囲む形にしている
    return parts.length ? `[${parts.join('][')}] ` : '';
}

export type LogLevel = 'debug' | 'info' | 'error';
//debug 開発中のメモ
//info テストのログ（通常はこちら）
//error エラーログ
const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, error: 2 };
// それぞれ点数をつける　0点、1点、2点


export class TestLogger {

    private buffer: string[] = [];
    private logPath: string;
    private level: LogLevel;


    constructor(outputDir: string, fileName: string, level: LogLevel = 'info') {
        
        // フォルダがなければ作る
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // ログファイルのパスを設定
        this.logPath = path.join(outputDir, fileName);
        // ログレベルを設定
        this.level = level;
    }

    // 指定したレベルに応じてログを書き込む
    private write(level: LogLevel, message: string) {
        // 現在のログレベルよりも低いレベルのログは無視する(スタンダートがINFOだからDEBUGは無視される)
        if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) return;

        //2026-01-22T09:16:27.123Z を取得する
        //split('T')[1]でT以降を取得し、slice(0, -1)で最後のZを削除している
        const time = new Date().toISOString().split('T')[1].slice(0, -1);

        // ログメッセージをフォーマットしてバッファに追加し、ファイルに追記する
        const line = `[${time}][${level.toUpperCase()}] ${message}`;
        this.buffer.push(line);

        // lineが一ずつbufferに追加されているので\nで区切って一行ずつファイルに追記する
        fs.appendFileSync(this.logPath, line + '\n');
    }

    // 従来のlogはinfoとして扱う
    //　上記のログを書き込む処理を呼び出すレベルごとに関数を分けている
    log(message: string) {
        this.write('info', message);
    }

    info(message: string) {
        this.write('info', message);
    }

    debug(message: string) {
        this.write('debug', message);
    }

    error(message: string) {
        this.write('error', message);
    }

    // 例外も含めて詳細を残す
    logError(err: unknown, context?: string | LogContext) {

        // errがError型かどうかをチェックし、messageとstackを適切に取得する
        // →要するにシステムが出したエラー型なのか、ただの文字列なのかを判別している
        const message = err instanceof Error ? err.message : String(err);
        
        // スタックトレースを持っているか確認をする（どこで失敗をしたのかが分かる奴）
        const stack = err instanceof Error && err.stack ? err.stack : '';

        // コンテキストがオブジェクトの場合はformatLogContextを使って文字列に変換する
        // 文字列の場合はそのまま使い、未定義の場合は空文字にする
        // nullチェックはオブジェクトの中身がNULLの可能性があるために入れている
        const ctxPrefix = typeof context === 'object' && context !== null
            ? formatLogContext(context as LogContext)
            : (context ? `${context} ` : '');
        this.error(`${ctxPrefix}message="${message}"${stack ? ` stack=${stack}` : ''}`);
    }

    // 失敗した時にログをぶちまける
    printFailureLogs(memberCode: string) {
        console.log(`\n============== ❌ 失敗ログ ==============`);
        console.log(`Member: ${memberCode}`);
        console.log(`-----------------------------------------`);
        console.log(this.buffer.join('\n'));
        console.log(`=========================================\n`);
    }
}