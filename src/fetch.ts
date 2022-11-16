import fetch from "node-fetch";
import * as AdmZip from "adm-zip";
import * as fs from "fs";
import * as path from "path";
import {depToConf, YAPM_TEMPLATE, YAPMConfig} from "./types";
import {checkLibData, checkLibRoot, libIsInstalled, saveLib} from "./structure";
import {FetchError} from "./exception";
import {readConfig, writeConfig} from "./project";

export async function installPackage(url: string, cwd: string) {
    let yapmConfig = readConfig(cwd);
    let packageConfig = await installCycle(url, cwd);

    yapmConfig.dependencies.push({
        name: packageConfig.name,
        version: packageConfig.version,
        resolve: url
    });

    writeConfig(cwd, yapmConfig);
}

async function installCycle(url: string, cwd: string): Promise<YAPMConfig> {
    const buff: Buffer = await fetchPackage(url);
    let zip = new AdmZip(buff);
    let config = zip.getEntry("yapm.json");
    if (!config) {
        throw new FetchError("Error on package file, could not find yapm.json");
    }

    let packageYapmConfig: YAPMConfig = JSON.parse(config.getData().toString("utf-8"));
    saveLib(cwd, zip, packageYapmConfig);

    for (const value of packageYapmConfig.dependencies) {
        if (!libIsInstalled(cwd, depToConf(value))) {
            await installCycle(value.resolve, cwd);
        }
    }

    return packageYapmConfig;
}

export function unInstallPackage(cwd: string, name: string, version: string) {
    let config: YAPMConfig = readConfig(cwd);
    let root: string = checkLibRoot(cwd);

    const template: YAPMConfig = Object.assign({}, YAPM_TEMPLATE);
    template.name = name;
    template.version = version;

    let libRoot = checkLibData(root, template, true);
    fs.rmSync(libRoot, {recursive: true});

    config.dependencies.slice(config.dependencies.findIndex(value => value.name == name), 1);

    writeConfig(cwd, config);
}

export async function fetchPackage(url: string): Promise<Buffer> {
    if (["/", "./", "../"].some(prefix => url.startsWith(prefix)) || path.isAbsolute(url) && fs.existsSync(url) && fs.statSync(url).isFile()) {
        return fs.readFileSync(url);
    }

    let response = await fetch(url);

    if (!response.ok) {
        throw new FetchError(`Could not fetch package "${url}"`);
    }

    return Buffer.from(await response.arrayBuffer());

}