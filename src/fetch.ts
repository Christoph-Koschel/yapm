import * as AdmZip from "adm-zip";
import * as fs from "fs";
import {depToConf, FetchBridge, OutputStream, YAPM_TEMPLATE, YAPMConfig} from "./types";
import {checkLibData, checkLibRoot, libIsInstalled, saveLib} from "./structure";
import {FetchError, WebException} from "./exception";
import {readConfig, writeConfig} from "./project";
import "./fetch-groups/group";

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
    const buff: Buffer = await fetchPackage(url, out);
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

export async function fetchPackage(uri: string, out: OutputStream): Promise<Buffer> {
    if (fs.existsSync(uri) && fs.statSync(uri).isFile()) {
        return fs.readFileSync(uri);
    }

    let match = uri.match(/.*:\/\/.*\/.*@.*/g);
    if (match == null) {
        throw new WebException("Wrong fetch format (<bridge>://<username>/<package name>@<version>)");
    }

    /// bridge://user-name/package-name@version
    let bridge: string = uri.match(/.*:\/\//g)[0];
    /// user-name/package-name@version
    uri = uri.replace(bridge, "");
    bridge = bridge.substring(0, bridge.length - 3);

    let username: string = uri.match(/.*\//g)[0];
    /// package-name@version
    uri = uri.replace(username, "");
    username = username.substring(1, username.length - 1);

    let packageName: string = uri.match(/.*@/)[0];
    packageName.substring(0, packageName.length - 1);

    let version: string = uri.replace(packageName, "");

    for (const fetchBridge of FetchBridge.getRegisters()) {
        if (fetchBridge.isBridge(bridge)) {
            let r = fetchBridge.fetch(bridge, username, packageName, version);
            r.catch((err) => {
                out(err);
            });
            return await r;
        }
    }

    out("No Bridge Class registered for the bridge " + bridge);
}