import {YAPMConfig, YAPMRegister} from "./types";
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

function getRegisterPath(): string {
    const appData: string = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    const base = path.join(appData, "yapm");
    const config = path.join(base, "register.json");
    if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) {
        fs.mkdirSync(base);
        fs.writeFileSync(config, JSON.stringify(<YAPMRegister[]>[
            {
                type: "GITHUB",
                name: "github.com",
                url: "http://github.com/{{username}}/{{package}}/releases/download/{{version}}/{{package}}-{{e-version}}.yapm.tar"
            }
        ]));
    }
    return config;
}

export function readRegisterConfig(): YAPMRegister[] {
    const p = getRegisterPath();
    try {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
    } catch (err) {
        throw new WrongFormatException("Register file has wrong format");
    }
}

export function writeRegisterConfig(registers: YAPMRegister[]) {
    const p = getRegisterPath();
    fs.writeFileSync(p, JSON.stringify(registers));
}