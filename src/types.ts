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