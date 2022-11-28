export interface YAPMConfig {
    name: string;
    version: string;
    dependencies: YAPMConfigDependencies[];
    author: string;
    license: string;
}
export interface YAPMConfigDependencies {
    name: string;
    version: string;
    resolve: string;
}
export interface OutputStream {
    (data: string): void;
}
export declare function depToConf(dep: YAPMConfigDependencies): YAPMConfig;
export declare const YAPM_TEMPLATE: YAPMConfig;
//# sourceMappingURL=types.d.ts.map