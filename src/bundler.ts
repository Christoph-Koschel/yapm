import {checkCWD, checkProjectConfigExists} from "./structure";
import {readConfig} from "./project";
import {OutputStream, YAPMConfig} from "./types";
import * as AdmZip from "adm-zip";
import * as path from "path";
import * as fs from "fs";

export function createPackage(cwd: string, out: OutputStream): string {
    checkCWD(cwd);

    checkProjectConfigExists(cwd);
    out.log("==== PACK PROJECT ====");

    let config: YAPMConfig = readConfig(cwd);

    let zip: AdmZip = new AdmZip();
    fs.readdirSync(cwd).forEach(value => {
        if (value != "lib" && !value.endsWith(".yapm.zip")) {
            let entry = path.join(cwd, value);
            out.log(`Include: "${entry}"`);
            if (fs.statSync(entry).isFile()) {
                zip.addLocalFile(entry);
            } else if (fs.statSync(entry).isDirectory()) {
                zip.addLocalFolder(entry, value);
            }
        }
    });

    out.log("Write tarball...");
    const outFile: string = path.join(cwd, config.name + "-" + config.version + ".yapm.zip");
    zip.writeZip(outFile);
    out.log("Package created");
    return outFile;
}