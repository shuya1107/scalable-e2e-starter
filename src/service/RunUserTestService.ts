import { test, TestInfo, Page } from '@playwright/test';

// ログ出力用のクラスと関数
import { TestLogger, formatLogContext } from '../utils/TestLogger';

import type { LogLevel, TestExecutionContext, TestStrategy } from '../typeList/index';

// DTOの型定義
import { RunUserTestDto } from '../dto/dtoIndex';



export class RunUserTestService {

    private runUserTestDto: RunUserTestDto;
    private logger: TestLogger;
    private testInfo: TestInfo;
    private page: Page;


    constructor(runUserTestDto: RunUserTestDto, testInfo: TestInfo, page: Page) {

        //ログについてのクラス
        const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
        const logger = new TestLogger(testInfo.outputDir, `log.txt`, logLevel);

        this.runUserTestDto =  runUserTestDto;
        this.logger = logger;
        this.testInfo = testInfo;
        this.page = page;

    }

    async runUserTestStart() {
        // テスト開始のログ出力
        this.testStartLog();

        try {

            // テストシナリオを配列の順番通りに進める
            for (let strategyIndex = 0; strategyIndex < this.runUserTestDto.testList.length; strategyIndex++) {
                const strategy = this.runUserTestDto.testList[strategyIndex];

                await this.execute(strategy, strategyIndex);

            }
        }catch (error) {
            this.logger.logError(error, { memberCode: this.runUserTestDto.data.memberCode });
            this.logger.printFailureLogs(this.runUserTestDto.data.memberCode);
            throw error; // エラーを再スローしてテストを失敗させる
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
            const result = await strategy.execute(context);

            if (!result) {
                // 失敗したらエラーを投げる（catchに飛ぶ）
                throw new Error(`${strategy.stepName} で false が返されました`);
            }

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
}