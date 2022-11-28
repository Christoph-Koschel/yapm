import * as AdmZip from "adm-zip";
import * as fs from "fs";
import * as http from "http";
import {depToConf, OutputStream, YAPM_TEMPLATE, YAPMConfig} from "./types";
import {checkLibData, checkLibRoot, libIsInstalled, saveLib} from "./structure";
import {FetchError, WebException} from "./exception";
import {readConfig, writeConfig} from "./project";
import * as url from "url";

export async function installPackage(url: string, cwd: string, out: OutputStream) {
    out("==== INSTALL ====");
    let yapmConfig = readConfig(cwd);
    let packageConfig = await installCycle(url, cwd, out);

    yapmConfig.dependencies.push({
        name: packageConfig.name,
        version: packageConfig.version,
        resolve: url
    });


    out("Installation finished");
    writeConfig(cwd, yapmConfig);
}

async function installCycle(url: string, cwd: string, out: OutputStream): Promise<YAPMConfig> {
    const buff: Buffer = await fetchPackage(url);
    let zip = new AdmZip(buff);
    let config = zip.getEntry("yapm.json");
    if (!config) {
        throw new FetchError("Error on package file, could not find yapm.json");
    }

    let packageYapmConfig: YAPMConfig = JSON.parse(config.getData().toString("utf-8"));
    out(`Install package "${packageYapmConfig.name}@${packageYapmConfig.version}"`);
    saveLib(cwd, zip, packageYapmConfig);

    for (const value of packageYapmConfig.dependencies) {
        if (!libIsInstalled(cwd, depToConf(value))) {
            out(`Install dependency "${value.name}@${value.version}"`);
            await installCycle(value.resolve, cwd, out);
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

    config.dependencies.splice(config.dependencies.findIndex(value => value.name == name), 1);
    writeConfig(cwd, config);
}

export async function fetchPackage(uri: string): Promise<Buffer> {
    if (fs.existsSync(uri) && fs.statSync(uri).isFile()) {
        return fs.readFileSync(uri);
    }

    return new Promise(resolve => {
        http.get({
            host: url.parse(uri).host,
            port: 80,
            path: url.parse(uri).pathname
        }, res => {
            let buff = Buffer.from([]);

            res.on("data", (data: Buffer) => {
                buff = Buffer.concat([buff, data]);
            });

            res.on("end", () => {
                resolve(buff);
            });
            res.on("error", () => {
                throw new WebException(`Cannot fetch url "${uri}"`);
            });
        });
    });
}