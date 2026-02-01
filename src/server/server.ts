import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { exec } from 'child_process'; 

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = 3000;
const CSV_FILE = path.join(process.cwd(), 'execution_report.csv');

// 1. 静的ファイル（HTMLなど）を公開する設定
app.use(express.static(path.join(process.cwd(), 'public')));

// 2. ブラウザが接続してきた時の処理
io.on('connection', (socket) => {
    console.log('クライアント（Web画面）が接続しました');

    // 接続した瞬間に、今のCSVの中身を全部送ってあげる
    sendCurrentLogs(socket);

    // ★追加2：ここから「トレース開いて！」の依頼処理
    socket.on('request-open-trace', (tracePath) => {
        // ★何が届いたかログに出す（これで原因が一発でわかります）
        console.log(`📩 リクエスト受信: "${tracePath}"`);

        if (!tracePath) {
            console.error('❌ パスが空っぽです');
            return;
        }

        const fullPath = path.resolve(process.cwd(), tracePath);
        console.log(`📂 開こうとしている場所: ${fullPath}`);

        // ファイルがあるかチェックする
        if (!fs.existsSync(fullPath)) {
            console.error('❌ ファイルが見つかりません！パスを確認してください。');
            return;
        }

        const command = `npx playwright show-trace "${fullPath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`💥 起動エラー: ${error.message}`);
                return;
            }
            console.log('✅ 起動成功！');
        });
    });
    // ★追加ここまで
});

// CSVを読み込んで送信する関数
function sendCurrentLogs(socket: any) {
    if (!fs.existsSync(CSV_FILE)) return;

    const results: any[] = [];
    
    fs.createReadStream(CSV_FILE)
        .pipe(parse({ columns: true, from_line: 1 })) // 1行目はヘッダーとして扱う
        .on('data', (row) => {
            results.push(row);
        })
        .on('end', () => {
            // 読み込み終わったらまとめて送信
            socket.emit('init-logs', results);
        });
}

// サーバー起動
httpServer.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 ダッシュボードサーバー起動！`);
    console.log(`👉 http://localhost:${PORT} にアクセスしてください`);
    console.log(`-----------------------------------------------`);
});