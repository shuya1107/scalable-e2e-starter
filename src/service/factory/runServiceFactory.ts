import { RunService } from '../RunService';

export function runServiceFactory() {
    const runService = new RunService();
    return runService;
}