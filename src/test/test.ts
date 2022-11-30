import {fetchPackage} from "../packages";

(async () => {
    console.log("TRY FETCH PACKAGE");
    let [res, buff] = await fetchPackage("yapm", "Christoph-Koschel", "1.0.1", console.log);
    console.log(res, buff);
})().then(() => process.exit(0));

