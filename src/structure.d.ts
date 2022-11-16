import { YAPMConfig } from "./types";
import * as AdmZip from "adm-zip";
export declare function checkCWD(cwd: string): void;
export declare function checkLibRoot(cwd: string, throw_?: boolean): string;
export declare function checkLibData(root: string, conf: YAPMConfig, throw_?: boolean): string;
export declare function checkLibConfig(libRoot: string): boolean;
export declare function checkLibConfigFormat(content: string): boolean;
export declare function saveLib(cwd: string, buff: AdmZip, conf: YAPMConfig): void;
export declare function libIsInstalled(cwd: string, conf: YAPMConfig): boolean;
export declare function checkProjectConfigExists(cwd: string): boolean;
//# sourceMappingURL=structure.d.ts.map