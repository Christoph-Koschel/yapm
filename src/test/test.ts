import {fetchPackage} from "../packages";

(async () => {
    console.log("TRY FETCH PACKAGE");
    let [res, buff] = await fetchPackage("yapm", "Christoph-Koschel", "latest", {
        log(data: string) {console.log(data)},
        error(data: string) {console.log(data)},
        warning(data: string) {console.log(data)},
    });
    console.log(res, buff);
})().then(() => process.exit(0));

