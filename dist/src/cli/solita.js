#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils");
const types_1 = require("./types");
const handlers_1 = require("./handlers");
const assert_1 = require("assert");
var Loader;
(function (Loader) {
    Loader[Loader["JSON"] = 0] = "JSON";
    Loader[Loader["JS"] = 1] = "JS";
})(Loader || (Loader = {}));
function loaderString(loader) {
    switch (loader) {
        case Loader.JSON:
            return 'JSON';
        case Loader.JS:
            return 'JavaScript';
    }
}
const SOLITA_CONFIG_RCS = [['.solitarc.js', Loader.JS]];
const PRETTIER_CONFIG_RCS = [
    ['.prettierrc', Loader.JSON],
    ['.prettierrc.js', Loader.JS],
    ['.prettierrc.json', Loader.JSON],
];
async function main() {
    var _a, _b;
    const solitaConfig = (_a = (await tryLoadLocalConfigRc(SOLITA_CONFIG_RCS, true))) === null || _a === void 0 ? void 0 : _a.config;
    if (solitaConfig == null) {
        throw new Error(`Unable to find solita config '.solitarc.js' in the current directory (${process.cwd()} `);
    }
    const removeIdl = (_b = solitaConfig.removeExistingIdl) !== null && _b !== void 0 ? _b : true;
    if (removeIdl) {
        const { idlDir, programName } = solitaConfig;
        const idlFile = path_1.default.join(idlDir, `${programName}.json`);
        const removed = await (0, utils_1.removeFileIfExists)(idlFile);
        if (removed) {
            (0, utils_1.logInfo)(`Removed existing IDL at ${idlFile}.\nDisable this by setting 'removeExistingIdl: false' inside the '.solitarc.js' config.`);
        }
    }
    const prettierRes = await tryLoadLocalConfigRc(PRETTIER_CONFIG_RCS);
    const prettierConfig = prettierRes === null || prettierRes === void 0 ? void 0 : prettierRes.config;
    if (prettierConfig != null) {
        (0, utils_1.logInfo)(`Found '${prettierRes.rcFile}' in current directory and using that to format code`);
    }
    let handlerResult;
    if ((0, types_1.isSolitaConfigAnchor)(solitaConfig)) {
        handlerResult = await (0, handlers_1.handleAnchor)(solitaConfig, prettierConfig);
    }
    if ((0, types_1.isSolitaConfigShank)(solitaConfig)) {
        handlerResult = await (0, handlers_1.handleShank)(solitaConfig, prettierConfig);
    }
    (0, assert_1.strict)(handlerResult != null, `IDL generator ${solitaConfig.idlGenerator} is not supported`);
    if ((0, types_1.isErrorResult)(handlerResult)) {
        (0, utils_1.logError)(handlerResult.errorMsg);
        (0, assert_1.strict)(handlerResult.exitCode != 0, 'Handler exit code should be non-zero if an error was encountered');
        process.exit(handlerResult.exitCode);
    }
    else {
        (0, utils_1.logInfo)('Success!');
    }
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    (0, utils_1.logError)(err);
    process.exit(1);
});
async function tryLoadLocalConfigRc(rcFiles, required = false) {
    for (const [rcFile, loader] of rcFiles) {
        const configPath = path_1.default.join(process.cwd(), rcFile);
        if (await (0, utils_1.canAccess)(configPath)) {
            try {
                const config = load(configPath, loader);
                (0, utils_1.logDebug)('Found `%s` in current directory', rcFile);
                return { config, rcFile };
            }
            catch (err) {
                (0, utils_1.logError)(`Failed to load '${rcFile}', ` +
                    `it should be a ${loaderString(loader)} file.`);
                (0, utils_1.logError)(err);
            }
        }
    }
    if (required) {
        throw new Error(`Cannot find any of '${rcFiles.join(',')}' ` +
            `config in current directory. Please create one.`);
    }
}
function load(configPath, loader) {
    switch (loader) {
        case Loader.JSON:
            return JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
        case Loader.JS:
            return require(configPath);
    }
}
//# sourceMappingURL=solita.js.map