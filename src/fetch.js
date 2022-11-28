"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPackage = exports.unInstallPackage = exports.installPackage = void 0;
const AdmZip = require("adm-zip");
const fs = require("fs");
const http = require("http");
const types_1 = require("./types");
const structure_1 = require("./structure");
const exception_1 = require("./exception");
const project_1 = require("./project");
const url = require("url");
async function installPackage(url, cwd, out) {
    out("==== INSTALL ====");
    let yapmConfig = (0, project_1.readConfig)(cwd);
    let packageConfig = await installCycle(url, cwd, out);
    yapmConfig.dependencies.push({
        name: packageConfig.name,
        version: packageConfig.version,
        resolve: url
    });
    out("Installation finished");
    (0, project_1.writeConfig)(cwd, yapmConfig);
}
exports.installPackage = installPackage;
async function installCycle(url, cwd, out) {
    const buff = await fetchPackage(url);
    let zip = new AdmZip(buff);
    let config = zip.getEntry("yapm.json");
    if (!config) {
        throw new exception_1.FetchError("Error on package file, could not find yapm.json");
    }
    let packageYapmConfig = JSON.parse(config.getData().toString("utf-8"));
    out(`Install package "${packageYapmConfig.name}@${packageYapmConfig.version}"`);
    (0, structure_1.saveLib)(cwd, zip, packageYapmConfig);
    for (const value of packageYapmConfig.dependencies) {
        if (!(0, structure_1.libIsInstalled)(cwd, (0, types_1.depToConf)(value))) {
            out(`Install dependency "${value.name}@${value.version}"`);
            await installCycle(value.resolve, cwd, out);
        }
    }
    return packageYapmConfig;
}
function unInstallPackage(cwd, name, version) {
    let config = (0, project_1.readConfig)(cwd);
    let root = (0, structure_1.checkLibRoot)(cwd);
    const template = Object.assign({}, types_1.YAPM_TEMPLATE);
    template.name = name;
    template.version = version;
    let libRoot = (0, structure_1.checkLibData)(root, template, true);
    fs.rmSync(libRoot, { recursive: true });
    config.dependencies.slice(config.dependencies.findIndex(value => value.name == name), 1);
    (0, project_1.writeConfig)(cwd, config);
}
exports.unInstallPackage = unInstallPackage;
async function fetchPackage(uri) {
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
            res.on("data", (data) => {
                buff = Buffer.concat([buff, data]);
            });
            res.on("end", () => {
                resolve(buff);
            });
            res.on("error", () => {
                throw new exception_1.WebException(`Cannot fetch url "${uri}"`);
            });
        });
    });
}
exports.fetchPackage = fetchPackage;
//# sourceMappingURL=fetch.js.map