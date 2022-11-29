export interface YAPMConfig {
    name: string;
    version: string;
    dependencies: YAPMConfigDependencies[];
    author: string;
    license: string
}


export interface YAPMConfigDependencies {
    name: string;
    version: string;
    resolve: string;
}

export interface OutputStream {
    (data: string): void
}

export abstract class FetchBridge {
    public abstract isBridge(bridge: string): boolean;

    public abstract fetch(bridge: string, username: string, packageName: string, version: string): Promise<Buffer>

    private static registers: FetchBridge[] = [];

    public static register(c: FetchBridge) {
        this.registers.push(c);
    }

    public static getRegisters(): FetchBridge[] {
        return this.registers;
    }
}

export function depToConf(dep: YAPMConfigDependencies): YAPMConfig {
    return {
        name: dep.name,
        version: dep.version,
        author: "<conversion>",
        license: "<conversion>",
        dependencies: []
    };
}

export const YAPM_TEMPLATE: YAPMConfig = {
    name: "",
    version: "",
    dependencies: [],
    license: "",
    author: ""
}