import { Page } from '@playwright/test';

export interface TestStrategy {

    //レポートに表示するステップ名（処理の題名、システム名とかかな)
    stepName: string;

    //真偽値を返すことでテストが失敗したときに終了させるようにする
    execute(page: Page, data: any): Promise<boolean>;

}