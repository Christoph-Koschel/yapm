"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProjectConfigExists = exports.libIsInstalled = exports.saveLib = exports.checkLibConfigFormat = exports.checkLibConfig = exports.checkLibData = exports.checkLibRoot = exports.checkCWD = void 0;
const fs = require("fs");
const types_1 = require("./types");
const path = require("path");
const exception_1 = require("./exception");
function checkCWD(cwd) {
    if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
        throw new exception_1.StructureException("Current working directory doesnt exists");
    }
}
exports.checkCWD = checkCWD;
function checkLibRoot(cwd, throw_) {
    checkCWD(cwd);
    const libRoot = path.join(cwd, "lib");
    if (!fs.existsSync(libRoot) || !fs.statSync(libRoot).isDirectory()) {
        if (throw_) {
            throw new exception_1.StructureException("Lib collection root folder doesn't exists");
        }
        fs.mkdirSync(libRoot);
    }
    return libRoot;
}
exports.checkLibRoot = checkLibRoot;
function checkLibData(root, conf, throw_) {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
        throw new exception_1.StructureException("Lib collection root folder doesn't exists");
    }
    const libRoot = path.join(root, conf.name);
    if (!fs.existsSync(libRoot) || !fs.statSync(libRoot).isDirectory()) {
        if (throw_) {
            throw new exception_1.StructureException("Lib folder doesn't exists");
        }
        fs.mkdirSync(libRoot);
    }
    const versionRoot = path.join(libRoot, conf.version);
    if (!fs.existsSync(versionRoot) || !fs.statSync(versionRoot).isDirectory()) {
        if (throw_) {
            throw new exception_1.StructureException("Lib version folder doesn't exists");
        }
        fs.mkdirSync(versionRoot);
    }
    if (fs.readdirSync(versionRoot).length != 0) {
        fs.rmdirSync(versionRoot, { recursive: true });
        return checkLibData(root, conf);
    }
    return versionRoot;
}
exports.checkLibData = checkLibData;
function checkLibConfig(libRoot) {
    if (!fs.existsSync(libRoot) || !fs.statSync(libRoot).isDirectory()) {
        throw new exception_1.StructureException("Lib version root folder doesn't exists");
    }
    let confFile = path.join(libRoot, "yapm.json");
    if (!fs.existsSync(confFile) || !fs.statSync(confFile).isFile()) {
        return false;
    }
    return checkLibConfigFormat(fs.readFileSync(confFile, "utf-8"));
}
exports.checkLibConfig = checkLibConfig;
function checkLibConfigFormat(content) {
    try {
        let oKeys = Object.keys(JSON.parse(content));
        for (let key of Object.keys(types_1.YAPM_TEMPLATE)) {
            if (!oKeys.includes(key)) {
                return false;
            }
        }
    }
    catch {
        return false;
    }
    return true;
}
exports.checkLibConfigFormat = checkLibConfigFormat;
function saveLib(cwd, buff, conf) {
    const root = checkLibRoot(cwd);
    const libRoot = checkLibData(root, conf);
    buff.extractAllTo(libRoot, true);
}
exports.saveLib = saveLib;
function libIsInstalled(cwd, conf) {
    try {
        let root = checkLibRoot(cwd, true);
        let libRoot = checkLibData(root, conf, true);
        return checkLibConfig(libRoot);
    }
    catch {
        return false;
    }
}
exports.libIsInstalled = libIsInstalled;
function checkProjectConfigExists(cwd) {
    checkCWD(cwd);
    const configFile = path.join(cwd, "yapm.json");
    return fs.existsSync(configFile) && fs.statSync(configFile).isFile();
}
exports.checkProjectConfigExists = checkProjectConfigExists;
//# sourceMappingURL=structure.js.map