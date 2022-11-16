"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeConfig = exports.readConfig = void 0;
const structure_1 = require("./structure");
const fs = require("fs");
const path = require("path");
const exception_1 = require("./exception");
function readConfig(cwd) {
    if (!(0, structure_1.checkProjectConfigExists)(cwd)) {
        throw new exception_1.ProjectInitException("Project not initialised");
    }
    const content = fs.readFileSync(path.join(cwd, "yapm.json"), "utf-8");
    if ((0, structure_1.checkLibConfigFormat)(content)) {
        return JSON.parse(content);
    }
    else {
        throw new exception_1.WrongFormatException("wrong format in yapm.json");
    }
}
exports.readConfig = readConfig;
function writeConfig(cwd, config) {
    (0, structure_1.checkCWD)(cwd);
    (0, structure_1.checkProjectConfigExists)(cwd);
    fs.writeFileSync(path.join(cwd, "yapm.json"), JSON.stringify(config, null, 4));
}
exports.writeConfig = writeConfig;
//# sourceMappingURL=project.js.map