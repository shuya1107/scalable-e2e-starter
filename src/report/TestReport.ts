import * as fs from 'fs';
import * as path from 'path';
import { TestGroupLog, TestLogDetail, TestStatus, User } from '../typeList/index';

export class TestReport {
    // 保存先をJSONに変更
    private static filePath = path.join(process.cwd(), 'execution_report.json');
    
    private startTime: number;
    
    // このテスト個別のデータ
    private memberData: User;
    private testName: string;
    private description: string;
    
    // 結果データ
    private status: TestStatus = 'FAIL';
    private message: string = '';
    private tracePath: string = '';

    /**
     * コンストラクタ
     * ★ 親情報（testName, description）も受け取るように変更！
     */
    constructor(memberAttributes: User, testName: string, description: string) {
        this.startTime = Date.now();
        this.memberData = memberAttributes;
        this.testName = testName;
        this.description = description;
    }

    /**
     * 初期化：空の配列 [] を作成する
     */
    static initialize() {
        try {
            if (fs.existsSync(this.filePath)) {
                fs.unlinkSync(this.filePath);
            }
            // 空のJSON配列で初期化
            fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
            console.log('📝 レポート(JSON)を初期化しました');
        } catch (e) {
            console.error('レポート初期化エラー:', e);
        }
    }

    setResult(status: TestStatus, message: string = '') {
        this.status = status;
        this.message = message;
    }

    setTracePath(path: string) {
        this.tracePath = path;
    }

    /**
     * JSONファイルに結果を構造化して保存する
     * (Read -> Modify -> Write)
     */
    save() {
        const duration = (Date.now() - this.startTime) / 1000;
        const timestamp = new Date().toLocaleString('ja-JP');

        // 1. 今回のログ明細データを作成
        const newLog: TestLogDetail = {
            executedAt: timestamp,
            memberCode: this.memberData.memberCode,
            status: this.status,
            message: this.message,
            durationSeconds: duration,
            tracePath: this.tracePath || '',
            userAttributes: this.memberData
        };

        try {
            // 2. 既存のJSONファイルを読み込む
            let reportData: TestGroupLog[] = [];
            if (fs.existsSync(TestReport.filePath)) {
                const fileContent = fs.readFileSync(TestReport.filePath, 'utf-8');
                // ファイルが空の場合は空配列扱い
                reportData = fileContent ? JSON.parse(fileContent) : [];
            }

            // 3. 該当する「テストグループ」を探す
            let targetGroup = reportData.find(group => group.testName === this.testName);

            if (targetGroup) {
                // A. 既にグループがあれば、そのlogsに追加
                targetGroup.logs.push(newLog);
            } else {
                // B. なければ、新しいグループを作って追加
                const newGroup: TestGroupLog = {
                    testName: this.testName,
                    description: this.description,
                    logs: [newLog]
                };
                reportData.push(newGroup);
            }

            // 4. ファイルに書き戻す (整形して書き込み)
            fs.writeFileSync(TestReport.filePath, JSON.stringify(reportData, null, 2));

        } catch (e) {
            console.error(`レポート保存失敗 (${this.memberData.memberCode}):`, e);
        }
    }
}