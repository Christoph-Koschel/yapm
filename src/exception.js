"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectInitException = exports.FetchError = exports.StructureException = exports.WrongFormatException = void 0;
class WrongFormatException extends Error {
    constructor(message) {
        super(message);
    }
}
exports.WrongFormatException = WrongFormatException;
class StructureException extends Error {
    constructor(message) {
        super(message);
    }
}
exports.StructureException = StructureException;
class FetchError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.FetchError = FetchError;
class ProjectInitException extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ProjectInitException = ProjectInitException;
//# sourceMappingURL=exception.js.map