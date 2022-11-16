"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPackage = exports.unInstallPackage = exports.installPackage = void 0;
const node_fetch_1 = require("node-fetch");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const types_1 = require("./types");
const structure_1 = require("./structure");
const exception_1 = require("./exception");
const project_1 = require("./project");
async function installPackage(url, cwd) {
    let yapmConfig = (0, project_1.readConfig)(cwd);
    let packageConfig = await installCycle(url, cwd);
    yapmConfig.dependencies.push({
        name: packageConfig.name,
        version: packageConfig.version,
        resolve: url
    });
    (0, project_1.writeConfig)(cwd, yapmConfig);
}
exports.installPackage = installPackage;
async function installCycle(url, cwd) {
    const buff = await fetchPackage(url);
    let zip = new AdmZip(buff);
    let config = zip.getEntry("yapm.json");
    if (!config) {
        throw new exception_1.FetchError("Error on package file, could not find yapm.json");
    }
    let packageYapmConfig = JSON.parse(config.getData().toString("utf-8"));
    (0, structure_1.saveLib)(cwd, zip, packageYapmConfig);
    for (const value of packageYapmConfig.dependencies) {
        if (!(0, structure_1.libIsInstalled)(cwd, (0, types_1.depToConf)(value))) {
            await installCycle(value.resolve, cwd);
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
async function fetchPackage(url) {
    if (["/", "./", "../"].some(prefix => url.startsWith(prefix)) || path.isAbsolute(url) && fs.existsSync(url) && fs.statSync(url).isFile()) {
        return fs.readFileSync(url);
    }
    let response = await (0, node_fetch_1.default)(url);
    if (!response.ok) {
        throw new exception_1.FetchError(`Could not fetch package "${url}"`);
    }
    return Buffer.from(await response.arrayBuffer());
}
exports.fetchPackage = fetchPackage;
//# sourceMappingURL=fetch.js.map