import { test } from '@playwright/test';

import { run } from '../src/TestRun/TestRun';

// テストレポートの初期化
import { TestReport } from '../src/report/TestReport';


//コンフィグファイルに設定しても動画をとってくれないため起動ファイルに直書きしてます。
test.use({
    // 1. ブラウザの画面自体をフルHDに広げる
    viewport: { width: 1920, height: 1080 },

    // 2. 録画サイズもフルHDに固定する
    video: {
        mode: 'on', 
        size: { width: 1920, height: 1080 }
    },
    
    //trace: 'on',
});


test.beforeAll(() => {
    // レポートの初期化（ファイルの作成）
    TestReport.initialize();
});

run();