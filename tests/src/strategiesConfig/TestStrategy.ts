import { Page } from '@playwright/test';
import { user } from '../../src/testDataType/testDataType';


export interface TestStrategy {

    //レポートに表示するステップ名（処理の題名、システム名とかかな)
    stepName: string;

    //真偽値を返すことでテストが失敗したときに終了させるようにする
    execute(page: Page, data: user): Promise<boolean>;

}