import { RunService } from '../RunService';
import { TestLogger } from '../../utils/TestLogger';

export function runServiceFactory(mainLogger: TestLogger, debugLogger: TestLogger) {
    const runService = new RunService(mainLogger, debugLogger);
    return runService;
}