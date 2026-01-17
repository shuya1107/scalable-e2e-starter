import * as fs from 'fs';
import * as path from 'path';

export class TestLogger {

    private buffer: string[] = [];
    private logPath: string;

    constructor(outputDir: string) {
        // フォルダがなければ作る（あの面倒な処理はコンストラクタに隠す！）
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        this.logPath = path.join(outputDir, 'log.txt');
    }

    // ログを記録する（ファイル＆メモリ）
    log(message: string) {
        const time = new Date().toISOString().split('T')[1].slice(0, -1);
        const line = `[${time}] ${message}`;
        
        this.buffer.push(line);
        fs.appendFileSync(this.logPath, line + '\n');
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