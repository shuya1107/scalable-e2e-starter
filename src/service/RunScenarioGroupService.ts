import { test } from '@playwright/test';

// テストデータのインポート
import userDataList from '../../testdata/users.json';

// DTOの型定義
import { RunScenarioGroupDto, RunUserTestDto } from '../dto/dtoIndex';

// ログ出力用のクラスと関数
import { formatLogContext } from '../utils/TestLogger';

// DTOファクトリー関数
import { runUserTestDtoFactory } from '../dto/dtoFactoryIndex';

// エラークラス
import { RunScenarioGroupServiceError } from '../error/systemErrorIndex';

import type { User } from '../typeList/index';

import { SystemErrorHandler } from '../error/errorHandler/SystemErrorHandler';


export class RunScenarioGroupService {

    private readonly dto: RunScenarioGroupDto;
    private readonly userDataList: User[][];
    private readonly errorHandler: SystemErrorHandler;
    
    

    constructor(dto: RunScenarioGroupDto) {
        this.dto = dto;
        this.userDataList = userDataList;
        const errorHandler = new SystemErrorHandler(this.dto.mainLogger, this.dto.debugLogger);
        this.errorHandler = errorHandler;
    }

    get scenarioIndex(): number {
        return this.dto.scenarioIndex;
    }

    get mainLogger() {
        return this.dto.mainLogger;
    }

    get debugLogger() {
        return this.dto.debugLogger;
    }

    get errorHandlerInstance() {
        return this.errorHandler;
    }

    createScenarioGroup() {

        // テスト実行対象の会員リストを取得する
        const targetUsers = this.createTestUserList();
        

        this.testBeforeAllLog(targetUsers); 

        this.testAfterAllLog();

        const runUserDto: RunUserTestDto[] = [];

        //テストスタート
        targetUsers.forEach((data:User) => {

            const runUserTestDto: RunUserTestDto = runUserTestDtoFactory({
                data,   //会員の情報
                testList: this.dto.testList,   //シナリオの配列
                myFunctionList: this.dto.myFunctionList   //関数のリスト
            });

            runUserDto.push(runUserTestDto);
        });

        return { runUserDto };
    }

    // 会員リストを取得する
    private createTestUserList() {

        // 会員の情報をとってくる
        // JSONは配列の中に配列でできている　シナリオと会員の情報どちらも同じインデックス番号が対応する
        //　データのチェックのみ
        const targetUsers = this.userDataList[this.dto.scenarioIndex];

        // もしシナリオの数より会員の数が少なかった（配列の数）場合スキップして終わらせる。
        if (!targetUsers) {
            const ctx = formatLogContext({ scenarioIndex: this.dto.scenarioIndex });
            if(this.dto.mainLogger){
                this.dto.mainLogger.error(`${ctx}異常終了(定義不足): シナリオ番号 ${this.dto.scenarioIndex + 1} に対応する会員データがありません。`);
                this.dto.mainLogger.error(`${ctx}user.json の配列数と testContents.json の配列数を確認してください。`);
            }
            throw new RunScenarioGroupServiceError(`${ctx}シナリオ番号 ${this.dto.scenarioIndex + 1} に対応する会員データがありません。users.json の配列数と testContents.json の配列数を確認してください。`);
        }

        return targetUsers;

    }

    private testBeforeAllLog(targetUsers: User[] | null) {

        //nullの可能性があるためのチェック且つ配列に何人のデータが入っているのかを確認する（テスト予定の会員数）
        const plannedMembers = (targetUsers && Array.isArray(targetUsers)) ? targetUsers.length : 0;

        // 実行フェーズだけで開始ログを出す
        test.beforeAll(() => {
            const ctx = formatLogContext({ scenarioIndex: this.dto.scenarioIndex });
            this.dto.debugLogger?.debug(`${ctx}runScenarioGroup 開始`);
            this.dto.mainLogger?.info(`${ctx}start: members planned=${plannedMembers}`);
            this.dto.debugLogger?.debug(`${ctx}members detail: ${JSON.stringify(targetUsers)}`);
        });

    }

    private testAfterAllLog() {
        // シナリオの全テスト完了のログ
        test.afterAll(() => {
            const ctx = formatLogContext({ scenarioIndex: this.dto.scenarioIndex });
            this.dto.mainLogger.info(`${ctx}Scenario Group ${this.dto.scenarioIndex + 1} 完了`);
            this.dto.debugLogger.debug(`${ctx}runScenarioGroup 完了`);
        });
    }
}