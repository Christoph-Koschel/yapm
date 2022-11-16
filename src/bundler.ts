import {checkCWD, checkProjectConfigExists} from "./structure";
import {readConfig} from "./project";
import {YAPMConfig} from "./types";
import * as AdmZip from "adm-zip";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";

export function createPackage(cwd: string) {
    checkCWD(cwd);

    checkProjectConfigExists(cwd);
    let config: YAPMConfig = readConfig(cwd);

    let zip: AdmZip = new AdmZip();
    fs.readdirSync(cwd).forEach(value => {
        if (value != "lib") {
            let entry = path.join(cwd, value);

            if (fs.statSync(entry).isFile()) {
                zip.addLocalFile(entry);
            } else if (fs.statSync(entry).isDirectory()) {
                zip.addLocalFolder(path.join(cwd, value));
            }
        }
    });

    zip.writeZip(path.join(cwd, config.name + "-" + config.version.replace(/\./gi, "_") + ".tar"));
}