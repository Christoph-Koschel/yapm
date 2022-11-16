"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackage = void 0;
const structure_1 = require("./structure");
const project_1 = require("./project");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");
function createPackage(cwd) {
    (0, structure_1.checkCWD)(cwd);
    (0, structure_1.checkProjectConfigExists)(cwd);
    let config = (0, project_1.readConfig)(cwd);
    let zip = new AdmZip();
    fs.readdirSync(cwd).forEach(value => {
        if (value != "lib") {
            let entry = path.join(cwd, value);
            if (fs.statSync(entry).isFile()) {
                zip.addLocalFile(entry);
            }
            else if (fs.statSync(entry).isDirectory()) {
                zip.addLocalFolder(path.join(cwd, value));
            }
        }
    });
    zip.writeZip(path.join(cwd, config.name + "-" + config.version.replace(/\./gi, "_") + ".tar"));
}
exports.createPackage = createPackage;
//# sourceMappingURL=bundler.js.map