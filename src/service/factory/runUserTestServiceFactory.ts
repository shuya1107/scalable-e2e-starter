import { TestInfo, Page } from '@playwright/test';

// サービスクラス
import { RunUserTestService } from '../RunUserTestService';

// DTOの型定義
import { RunUserTestDto } from '../../dto/dtoIndex';


export function runUserTestServiceFactory(
    runUserTestDto: RunUserTestDto,
    testInfo: TestInfo,
    page: Page
) {
    return new RunUserTestService(
        runUserTestDto,
        testInfo,
        page
    );
}