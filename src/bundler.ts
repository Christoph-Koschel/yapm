import {checkCWD, checkProjectConfigExists} from "./structure";
import {readConfig} from "./project";
import {OutputStream, YAPMConfig} from "./types";
import * as AdmZip from "adm-zip";
import * as path from "path";
import * as fs from "fs";

export function createPackage(cwd: string, out: OutputStream): string {
    checkCWD(cwd);

    checkProjectConfigExists(cwd);
    out("==== PACK PROJECT ====");

    let config: YAPMConfig = readConfig(cwd);

    let zip: AdmZip = new AdmZip();
    fs.readdirSync(cwd).forEach(value => {
        if (value != "lib" && !value.endsWith(".yapm.tar")) {
            let entry = path.join(cwd, value);
            out(`Include: "${entry}"`);
            if (fs.statSync(entry).isFile()) {
                zip.addLocalFile(entry);
            } else if (fs.statSync(entry).isDirectory()) {
                zip.addLocalFolder(entry, value);
            }
        }
    });

    out("Write tarball...");
    const outFile: string = path.join(cwd, config.name + "-" + config.version.replace(/\./gi, "-") + ".yapm.tar");
    zip.writeZip(outFile);
    out("Package created");
    return outFile;
}