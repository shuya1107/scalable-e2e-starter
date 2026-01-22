import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './tests',
  //テストのファイルがどこに入っているか

  fullyParallel: true,
  //できる限り同時に実行を行う

  retries: process.env.CI ? 2 : 0,
  //CI（本番環境）では2回試す（失敗した場合）ローカルは一回だけ行い失敗したらテスト失敗

  workers: process.env.CI ? 1 : 1,
  //ブラウザを何個同時に開くかCI（本番環境）では１つローカル環境では自動で最大

  reporter: 'html',
  //終わった後にHTMLでレポートを出力
  use: {
    video: 'on',

    trace: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ]
});
