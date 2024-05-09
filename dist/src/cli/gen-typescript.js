"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTypeScriptSDK = void 0;
const solita_1 = require("../solita");
const utils_1 = require("../utils");
function generateTypeScriptSDK(idl, sdkDir, prettierConfig, typeAliases, serializers, anchorRemainingAccounts) {
    (0, utils_1.logInfo)('Generating TypeScript SDK to %s', sdkDir);
    const gen = new solita_1.Solita(idl, {
        formatCode: true,
        formatOpts: prettierConfig,
        typeAliases,
        serializers,
        anchorRemainingAccounts,
    });
    return gen.renderAndWriteTo(sdkDir);
}
exports.generateTypeScriptSDK = generateTypeScriptSDK;
//# sourceMappingURL=gen-typescript.js.map