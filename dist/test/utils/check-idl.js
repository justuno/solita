"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIdl = void 0;
const solita_1 = require("../../src/solita");
const path_1 = __importDefault(require("path"));
const verify_code_1 = require("../utils/verify-code");
const rimraf_1 = require("rimraf");
async function checkIdl(t, idl, label, opts) {
    const outputDir = path_1.default.join(__dirname, 'output', label);
    const generatedSDKDir = path_1.default.join(outputDir, 'generated');
    (0, rimraf_1.sync)(outputDir);
    opts !== null && opts !== void 0 ? opts : (opts = { formatCode: true });
    const gen = new solita_1.Solita(idl, opts);
    await gen.renderAndWriteTo(generatedSDKDir);
    await (0, verify_code_1.verifyWithTypescriptCompiler)(t, generatedSDKDir);
    await (0, verify_code_1.verifySyntacticCorrectnessForGeneratedDir)(t, generatedSDKDir);
    await (0, verify_code_1.verifyTopLevelScriptForGeneratedDir)(t, generatedSDKDir);
    return { outputDir, generatedSDKDir };
}
exports.checkIdl = checkIdl;
//# sourceMappingURL=check-idl.js.map