import { RunScenarioGroupDto } from '../../dto/dtoIndex';
import { RunScenarioGroupService } from '../RunScenarioGroupService';

export function runScenarioGroupServiceFactory(runScenarioGroupDto: RunScenarioGroupDto) {
    const runScenarioGroupService = new RunScenarioGroupService(runScenarioGroupDto);
    return runScenarioGroupService;
}