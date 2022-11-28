/// <reference types="node" />
import { OutputStream } from "./types";
export declare function installPackage(url: string, cwd: string, out: OutputStream): Promise<void>;
export declare function unInstallPackage(cwd: string, name: string, version: string): void;
export declare function fetchPackage(uri: string): Promise<Buffer>;
//# sourceMappingURL=fetch.d.ts.map