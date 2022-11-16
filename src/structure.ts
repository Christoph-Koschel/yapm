import * as fs from "fs";
import {YAPM_TEMPLATE, YAPMConfig} from "./types";
import * as path from "path";
import * as AdmZip from "adm-zip";
import {StructureException} from "./exception";

export function checkCWD(cwd: string) {
    if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
        throw new StructureException("Current working directory doesnt exists");
    }
}

export function checkLibRoot(cwd: string, throw_?: boolean): string {
    checkCWD(cwd);

    const libRoot: string = path.join(cwd, "lib");

    if (!fs.existsSync(libRoot) || !fs.statSync(libRoot).isDirectory()) {
        if (throw_) {
            throw new StructureException("Lib collection root folder doesn't exists");
        }
        fs.mkdirSync(libRoot);
    }

    return libRoot;
}

export function checkLibData(root: string, conf: YAPMConfig, throw_?: boolean): string {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
        throw new StructureException("Lib collection root folder doesn't exists");
    }

    const libRoot = path.join(root, conf.name);

    if (!fs.existsSync(libRoot) || !fs.statSync(libRoot).isDirectory()) {
        if (throw_) {
            throw new StructureException("Lib folder doesn't exists");
        }
        fs.mkdirSync(libRoot);
    }

    const versionRoot = path.join(libRoot, conf.version);
    if (!fs.existsSync(versionRoot) || !fs.statSync(versionRoot).isDirectory()) {
        if (throw_) {
            throw new StructureException("Lib version folder doesn't exists");
        }
        fs.mkdirSync(versionRoot);
    }

    if (fs.readdirSync(versionRoot).length != 0) {
        fs.rmdirSync(versionRoot, {recursive: true});
        return checkLibData(root, conf);
    }

    return versionRoot;
}

export function checkLibConfig(libRoot: string): boolean {
    if (!fs.existsSync(libRoot) || !fs.statSync(libRoot).isDirectory()) {
        throw new StructureException("Lib version root folder doesn't exists");
    }

    let confFile = path.join(libRoot, "yapm.json");
    if (!fs.existsSync(confFile) || !fs.statSync(confFile).isFile()) {
        return false;
    }

    return checkLibConfigFormat(fs.readFileSync(confFile, "utf-8"));
}

export function checkLibConfigFormat(content: string): boolean {
    try {
        let oKeys = Object.keys(JSON.parse(content));

        for (let key of Object.keys(YAPM_TEMPLATE)) {
            if (!oKeys.includes(key)) {
                return false;
            }
        }
    } catch {
        return false;
    }

    return true;
}

export function saveLib(cwd: string, buff: AdmZip, conf: YAPMConfig) {
    const root = checkLibRoot(cwd);
    const libRoot = checkLibData(root, conf);

    buff.extractAllTo(libRoot, true);
}

/**
 * Note: A library is for yapm installed when the yapm.json config file exists and has the right format
 * @param cwd
 * @param conf
 */
export function libIsInstalled(cwd: string, conf: YAPMConfig): boolean {
    try {
        let root = checkLibRoot(cwd, true);
        let libRoot = checkLibData(root, conf, true);

        return checkLibConfig(libRoot);
    } catch {
        return false;
    }
}

export function checkProjectConfigExists(cwd: string): boolean {
    checkCWD(cwd);

    const configFile = path.join(cwd, "yapm.json");

    return fs.existsSync(configFile) && fs.statSync(configFile).isFile();


}