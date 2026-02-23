import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AxiosError } from 'axios'

// .envファイルの内容を読み込む設定
dotenv.config();

// ★VPSのURL (Java側のControllerに送るための宛先)
const API_URL = process.env.API_URL as string;

// ★変更点：REPORT_PATH をルート階層のファイルに変更
// path.join(process.cwd(), 'ファイル名') とすることで、一番上の階層のファイルを指定できます
const REPORT_PATH = path.join(process.cwd(), 'execution_report.json');

// トレースZIPは今まで通り test-results/traces フォルダ内を見に行く
const TRACES_DIR = path.join(process.cwd(), 'test-results', 'traces');

// 環境変数のチェック
if (!API_URL) {
  console.error('❌ エラー: 環境変数 API_URL が設定されていません。');
  process.exit(1);
}

async function uploadResults(): Promise<void> {
  // ★重要：JSONファイルがちゃんとルート階層にあるか確認する
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`❌ エラー: レポートファイルが見つかりません: ${REPORT_PATH}`);
    console.error('   一番上のフォルダに execution_report.json があるか確認してください。');
    process.exit(1);
  }

  try {
    // FormData: ファイル送信用の「魔法の箱」。Javaでいう MultipartFile を送るための準備です
    const form = new FormData();

    // ★メインのJSONファイルを箱に入れる
    // filename: execution_report.json という名前でサーバーに届きます
    // contentType: サーバー側に「これはJSONデータですよ」と教えてあげます
    form.append('file', fs.createReadStream(REPORT_PATH), {
        filename: 'execution_report.json',
        contentType: 'application/json',
    });

    // トレースZIPファイル（画面録画など）があれば、それも全部箱に入れる
    if (fs.existsSync(TRACES_DIR)) {
      const files = fs.readdirSync(TRACES_DIR).filter((f) => f.endsWith('.zip'));
      
      files.forEach((f) => {
        const fullPath = path.join(TRACES_DIR, f);
        // Java側の @RequestParam("traces") で配列として受け取れるように追加
        form.append('traces', fs.createReadStream(fullPath), { filename: f });
      });
    }

    console.log('📦 ルート階層のJSONレポート＋トレースZIPを送信します...');
    console.log(`   送信ファイル: ${REPORT_PATH}`);
    console.log(`   送信先URL: ${API_URL}`);

    /**
     * axios.post: インターネットを通じてデータを送る（POST通信）
     * headers: form.getHeaders() を書くことで、ファイル送信に必要な「境界線（boundary）」を自動設定します
     * これがないとJava側が「どこまでがファイルデータか」分からずエラーになります
     */
    const response = await axios.post(API_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('✅ 送信成功！');
    console.log('   サーバーからの応答:', response.data);

  } catch (error: unknown) { // ★ ここを unknown にします（anyをやめる）
    console.error('❌ 送信失敗...');

    // 1. Axiosのエラーかどうか判定する（型ガード）
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError; // これで response や code に安全にアクセスできます

      if (axiosError.response) {
        // サーバーから応答があった場合（4xx, 5xxエラー）
        console.error(`   Status: ${axiosError.response.status}`);
        
        const responseData = axiosError.response.data;
        console.error(`   Data: ${typeof responseData === 'object' ? JSON.stringify(responseData) : responseData}`);
      
      } else if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT') {
        // サーバーに接続できなかった場合
        console.error('   接続できませんでした。VPSのポートが開放されているか、URLが正しいか確認してください。');
        console.error(`   Error Code: ${axiosError.code}`);
      
      } else {
        // リクエスト設定中のエラーなど
        console.error(`   Error Message: ${axiosError.message}`);
      }

    } else if (error instanceof Error) {
      // 2. Axios以外のエラー（ファイル読み込みエラーなど、標準のJSエラー）
      console.error(`   System Error: ${error.message}`);
    
    } else {
      // 3. 全く想定外のエラー
      console.error('   Unknown Error:', error);
    }

    process.exit(1);
  }
}

// 実行
uploadResults();