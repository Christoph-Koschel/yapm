import {YAPMConfig} from "./types";
import {checkCWD, checkLibConfigFormat, checkProjectConfigExists} from "./structure";
import * as fs from "fs";
import * as path from "path";
import {ProjectInitException, WrongFormatException} from "./exception";

export function readConfig(cwd: string): YAPMConfig {
    if (!checkProjectConfigExists(cwd)) {
        throw new ProjectInitException("Project not initialised");
    }

    const content = fs.readFileSync(path.join(cwd, "yapm.json"), "utf-8");

    if (checkLibConfigFormat(content)) {
        /// Need no try-catch cause of the helper function
        /// a wrong json format cannot appear
        return JSON.parse(content);
    } else {
        throw new WrongFormatException("wrong format in yapm.json");
    }
}

export function writeConfig(cwd: string, config: YAPMConfig) {
    checkCWD(cwd);
    checkProjectConfigExists(cwd);
    fs.writeFileSync(path.join(cwd, "yapm.json"), JSON.stringify(config, null, 4));
}