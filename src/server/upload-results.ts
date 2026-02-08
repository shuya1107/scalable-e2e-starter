import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ★VPSのURL
const API_URL = process.env.API_URL as string;

// プロジェクト直下の execution_report.csv
const FILE_PATH = path.join(process.cwd(), 'execution_report.csv');

//　環境変数（API_URL）が設定されていない場合はエラー終了
if (!API_URL) {
  console.error('❌ エラー: 環境変数 API_URL が設定されていません。');
  console.error('   .env ファイルを作成し、API_URL=https://... を記述してください。');
  process.exit(1);
}

// トレースZIPのあるフォルダ
const TRACES_DIR = path.join(process.cwd(), 'test-results', 'traces');

async function uploadCSV(): Promise<void> {
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ エラー: ファイルが見つかりません: ${FILE_PATH}`);
    console.error('   先にPlaywrightを実行してレポート(execution_report.csv)を作成してください。');
    process.exit(1);
  }

  try {
    //　CSV、Zipファイルなど重いファイルでも送信できる便利なもの　インポートして使っている、Javaでいうクラスライブラリ
    const form = new FormData();

    // CSVファイルを送信する箱に追加している
    form.append('file', fs.createReadStream(FILE_PATH));

    // traces フォルダ内の zip を全部追加
    // traces フォルダが存在するの確認
    if (fs.existsSync(TRACES_DIR)) {
      // filterで.zipだけ抽出している（ジップファイルだけ送信するため）配列を作成
      const files = fs.readdirSync(TRACES_DIR).filter((f) => f.endsWith('.zip'));
      files.forEach((f) => {
        // traces フォルダ内のzipファイルを送信する箱に追加している
        const fullPath = path.join(TRACES_DIR, f);
        form.append('traces', fs.createReadStream(fullPath), path.basename(fullPath));
      });
    }

    console.log('📦 CSV＋トレースZIPを送信します...');
    console.log(`   送信ファイル: ${FILE_PATH}`);
    console.log(`   送信先URL: ${API_URL}`);

    /**
     * APIを使っているやつこれ
     * axios(分かれているシステム間でHTTP通信を行うライブラリ)でPOST送信
     * postが送る　
     * 第一引数：送信先URL
     * 第二引数：送信データ
     * 第三引数：ヘッダー情報などのオプション
     * headers: form.getHeaders() で、FormDataが生成した適切なヘッダーを設定　というか定型文これ書いておけばOK
     */
    const response = await axios.post(API_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('✅ 送信成功！');
    console.log('   サーバーからの応答:', response.data);
  } catch (error: any) {
    console.error('❌ 送信失敗...');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${error.response.data}`);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('   接続できませんでした。VPSのポート8080が開放されているか確認してください。');
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

uploadCSV();
