import { test, TestInfo, Page } from '@playwright/test';

// ログ出力用のクラスと関数
import { TestLogger, formatLogContext } from '../utils/TestLogger';

import type { LogLevel, TestExecutionContext, TestStrategy } from '../typeList/index';

// DTOの型定義
import { RunUserTestDto } from '../dto/dtoIndex';

import { ExpectedErrorHandler } from '../error/errorHandler/ExpectedErrorHandler';


import * as path from 'path';
import * as fs from 'fs';
import { testReportFactory } from '../factory/reportFactory/testReportFactory';


export class RunUserTestService {

    private runUserTestDto: RunUserTestDto;
    private logger: TestLogger;
    private debugLogger: TestLogger;
    private testInfo: TestInfo;
    private page: Page;
    private testName: string;
    private description: string;


    constructor(runUserTestDto: RunUserTestDto, testInfo: TestInfo, page: Page) {

        //ログについてのクラス
        const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
        const logger = new TestLogger(testInfo.outputDir, `log.txt`, logLevel);
        const debugLogger = new TestLogger(testInfo.outputDir, `debug.log`, 'debug');

        this.runUserTestDto =  runUserTestDto;
        this.logger = logger;
        this.debugLogger = debugLogger;
        this.testInfo = testInfo;
        this.page = page;
        this.testName = runUserTestDto.testName;
        this.description = runUserTestDto.description;

    }

    async runUserTestStart() {

        // ここで明示的にトレース(録画)を開始します
        // レポートに表示するためのトレースを保存する準備
        await this.startTracing();
        
        //  レポート用紙（TestReport）を作成して計測開始
        const report = testReportFactory(
            this.runUserTestDto.data,
            this.testName,
            this.description
        );

        // テスト開始のログ出力
        this.testStartLog(); 

        try {

            // テストシナリオを配列の順番通りに進める
            for (let strategyIndex = 0; strategyIndex < this.runUserTestDto.testList.length; strategyIndex++) {
                const strategy = this.runUserTestDto.testList[strategyIndex];

                await this.execute(strategy, strategyIndex);

            }

            // 最後まで完走したら「SUCCESS」をセット
            report.setResult('SUCCESS', '正常終了');

        }catch (error: unknown) {
            this.logger.logError(error, { memberCode: this.runUserTestDto.data.memberCode });
            this.logger.printFailureLogs(this.runUserTestDto.data.memberCode);

            const expectedErrorHandler = new ExpectedErrorHandler(this.logger, this.debugLogger);
            await expectedErrorHandler.handle(error, report, this.runUserTestDto.data.status);

            

        }finally {

            // ★ここを書き換えます --------------------------------------

            // 1. 保存先のフォルダパスを決める（test-results の中の traces フォルダ）
            const traceDir = path.join('test-results', 'traces');

            // 2. フォルダが存在しない場合は自動で作る（これがないとエラーになります）
            if (!fs.existsSync(traceDir)) {
                fs.mkdirSync(traceDir, { recursive: true });
            }

            // 3. ファイル名を決める（上書き防止のため一意化）
            const safeTestName = this.testName.replace(/[^a-zA-Z0-9_-]/g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `trace-${safeTestName}-${this.runUserTestDto.data.memberCode}-${timestamp}.zip`;
            // 最終的なパス: test-results/traces/trace-M009.zip
            const tracePath = path.join(traceDir, fileName);

            try {
                // 4. 指定したフォルダに保存！
                await this.page.context().tracing.stop({ path: tracePath });

                // 5. レポートにはこの新しいパスを記録
                report.setTracePath(tracePath);
                
                console.log(`🎥 トレース保存: ${tracePath}`);

            } catch (e) {
                console.error('トレース保存失敗:', e);
            }

            // ★ここまで --------------------------------------------------

            // レポートを保存
            report.save();
        }

        
    }

    testStartLog() {
        const baseCtx = formatLogContext({ memberCode: this.runUserTestDto.data.memberCode });
        this.logger.info(`${baseCtx}START: Member ${this.runUserTestDto.data.memberCode} のテスト開始`);
    }

    async execute(strategy: TestStrategy, strategyIndex: number) {

        await test.step(strategy.stepName, async () => {

            const stepCtx = formatLogContext({ 
                memberCode: this.runUserTestDto.data.memberCode, 
                stepName: strategy.stepName 
            });

            this.logger.debug(`${stepCtx}Step 実行中`);

            //テスト起動
            //テスト情報とこのテストで使う関数のリスト、テストの番号を渡す（何番目のテストなのか）
            const context: TestExecutionContext = this.createTestExecutionContext(strategyIndex);
            await strategy.execute(context);

            this.logger.debug(`${stepCtx}Step OK`);
        });
    }

    // テスト実行コンテキストを作成する関数
    private createTestExecutionContext(strategyIndex: number): TestExecutionContext {
        return {
            page: this.page,
            data: this.runUserTestDto.data,
            functions: this.runUserTestDto.myFunctionList,
            testInfo: this.testInfo,
            strategyIndex
        };
    }

    private async startTracing() {
        // ★追加: ここで明示的にトレース(録画)を開始します
        // これがないと "Must start tracing before stopping" と怒られます
        await this.page.context().tracing.start({ 
            screenshots: true, 
            snapshots: true, 
            sources: true      // ソースコードも記録する
        });
    }
}