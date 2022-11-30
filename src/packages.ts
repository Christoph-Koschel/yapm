import * as AdmZip from "adm-zip";
import * as fs from "fs";
import * as url from "url";
import * as path from "path";
import * as os from "os";
import * as http from "http";
import {depToConf, OutputStream, YAPM_TEMPLATE, YAPMConfig, YAPMConfigDependencies, YAPMRegister} from "./types";
import {checkLibData, checkLibRoot, libIsInstalled, saveLib} from "./structure";
import {FetchError} from "./exception";
import {readConfig, readRegisterConfig, writeConfig} from "./project";
import * as child_process from "child_process";

export function uninstallPackage(cwd: string, name: string, version: string) {
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

export async function installPackage(fetch: { packageName: string, username?: string, version?: string }, cwd: string, out: OutputStream) {
    out("==== INSTALL ====");
    let yapmConfig = readConfig(cwd);
    let [resolve, packageConfig] = await installCycle(fetch, cwd, out);

    let dep: YAPMConfigDependencies = {
        name: packageConfig.name,
        version: packageConfig.version,
        resolve: resolve
    }

    if (!dependencyExists(yapmConfig, dep)) {
        yapmConfig.dependencies.push(dep);
    }

    out("Installation finished");
    writeConfig(cwd, yapmConfig);
}

async function installCycle(fetch: { packageName: string, username?: string, version?: string }, cwd: string, out: OutputStream): Promise<[string, YAPMConfig]> {
    let buff: Buffer;
    let url: string;

    if (fetch.username == null && fetch.version == null) {
        buff = await fetchPackageURL(fetch.packageName, out);
        url = fetch.packageName;

    } else {
        let [_, __] = await fetchPackage(fetch.packageName, fetch.username, fetch.version, out);
        url = _;
        buff = __;
    }

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
            await installCycle({packageName: value.resolve}, cwd, out);
        }
    }

    return [url, packageYapmConfig];
}

export async function fetchPackageURL(uri: string, out: OutputStream) {
    if (fs.existsSync(uri) && fs.statSync(uri).isFile()) {
        return fs.readFileSync(uri);
    }

    return await fetchURL(uri);
}

export async function fetchPackage(packageName: string, username: string, version: string, out: OutputStream): Promise<[string, Buffer]> {
    const registers: YAPMRegister[] = readRegisterConfig();
    for (const value of registers) {
        let url = value.url;
        url = url.replace(/\{\{package}}/gi, packageName);
        url = url.replace(/\{\{username}}/gi, username);
        url = url.replace(/\{\{version}}/gi, version);
        url = url.replace(/\{\{e-version}}/gi, version.replace(/\./gi, "-"));

        switch (value.type) {
            case "GITHUB":
                out("Fetch Package from " + value.name);
                if (await urlExists(url)) {
                    return [url, await fetchURL(url)];
                }
            case "GIT":
                break;
            case "YAPM-REG":
                break;
        }
    }

    throw new FetchError("Cannot resolve " + packageName);
}

async function urlExists(uri: string): Promise<boolean> {
    return new Promise((resolve) => {
        let req = http.request({
            method: "HEAD",
            host: url.parse(uri).hostname,
            port: 80,
            path: url.parse(uri).pathname
        }, (res) => {
            res.on("error", (err) => {
                console.log(err.message);
            });
            resolve(res.statusCode.toString()[0] == "3" || res.statusCode.toString()[0] == "2");
        });
        req.end();

    });
}

async function fetchURL(uri: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        let tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "yapm"));
        let tmpFile = path.join(tmpDir, "download.tgz");
        // let stream = fs.createWriteStream(tmpFile);

        // let req = http.get({
        //     method: "GET",
        //     host: url.parse(uri).hostname,
        //     port: 80,
        //     path: url.parse(uri).pathname,
        //     agent: new http.Agent({
        //         keepAlive: true
        //     }),
        //     headers: {
        //         "Accept": "application/octet-stream"
        //     }
        // }, (res) => {
        //     let buffs: Buffer[] = [];
        //     console.log(res.statusCode);
        //     res.pipe(stream);
        //
        //     res.on("error", (err) => console.log(err.message));
        //     // res.on("data", (data) => {
        //     //     console.log("DATA: " + data.toString());
        //     //     buffs.push(data);
        //     // });
        //     res.on("end", () => {
        //         resolve(Buffer.concat(buffs));
        //     });
        // });
        // console.log(req.getHeader("Accept"));


        let cmd;

        if (process.platform == "win32") {
            cmd = `Powershell.exe -Command "Invoke-RestMethod -Uri ${uri} -OutFile ${tmpFile}"`;
        } else if (process.platform == "darwin" || process.platform == "linux") {
            cmd = `curl ${uri} > ${tmpFile}`;
        }

        child_process.execSync(cmd, {
            windowsHide: true
        });
        let buff = fs.readFileSync(tmpFile);
        resolve(buff);
    });
}

export function dependencyExists(config: YAPMConfig, dep: YAPMConfigDependencies): boolean {
    for (let dependency of config.dependencies) {
        if (dependency.name == dep.name && dependency.version == dep.version) {
            return true;
        }
    }

    return false;
}

// yapm install -p yapm -u Christoph-Koschel -v 1.0.0