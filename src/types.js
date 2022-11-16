"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YAPM_TEMPLATE = exports.depToConf = void 0;
function depToConf(dep) {
    return {
        name: dep.name,
        version: dep.version,
        author: "<conversion>",
        license: "<conversion>",
        dependencies: []
    };
}
exports.depToConf = depToConf;
exports.YAPM_TEMPLATE = {
    name: "",
    version: "",
    dependencies: [],
    license: "",
    author: ""
};
//# sourceMappingURL=types.js.map