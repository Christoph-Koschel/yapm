import {FetchBridge} from "../types";
import * as http from "http";

class GitBridge extends FetchBridge {
    fetch(bridge: string, username: string, packageName: string, version: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {

            const download = `https://github.com/${username}/${packageName}/releases/download/${version}/${packageName}-${version.replace(/\./g, "-")}.yapm.tgz`;

            let buffs: Buffer[] = [];

            http.get(download, (res) => {
                res.on("data", (data) => {
                    buffs.push(data);
                });
                res.on("end", () => {
                    resolve(Buffer.concat(buffs));
                });
                res.on("error", (err) => {
                    reject(err.message);
                });
            });
        });
    }

    isBridge(bridge: string): boolean {
        return bridge == "git" || bridge == "github" || bridge == "github.com";
    }

}

FetchBridge.register(new GitBridge());

/// yapm install -p git://christoph-koschel/yapml@1.0.0