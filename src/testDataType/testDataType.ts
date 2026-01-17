//型定義後から変更になっても問題ない追加するだけならね（interface)JSONも変更しないとだけど
export type ScenarioStep = string[];

export interface user {
    memberCode: string;
    key: string;
}

export type Test = {
    userData: user;
    scenarios: ScenarioStep;
    functions: any;
}