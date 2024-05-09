"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWithTypescriptCompiler = exports.verifyTopLevelScriptForGeneratedDir = exports.verifyTopLevelScript = exports.verifySyntacticCorrectnessForGeneratedDir = exports.verifySyntacticCorrectness = exports.verifyImports = exports.DEFAULT_VERIFY_IMPORTS_OPTS = exports.analyzeCode = exports.deepLog = void 0;
const fs_1 = require("fs");
const os_1 = __importDefault(require("os"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const esbuild_1 = require("esbuild");
const spok_1 = __importDefault(require("spok"));
const util_1 = require("util");
const eslint_1 = require("eslint");
const serdes_1 = require("../../src/serdes");
const recursive_readdir_1 = __importDefault(require("recursive-readdir"));
const child_process_1 = require("child_process");
const util_2 = require("util");
const tsc_1 = require("./tsc");
const exec = (0, util_2.promisify)(child_process_1.exec);
const esr = path_1.default.join(require.resolve('esbuild-runner'), '..', '..', 'bin', 'esr.js');
const eslint = new eslint_1.ESLint({
    overrideConfig: {
        plugins: ['@typescript-eslint'],
        parser: '@typescript-eslint/parser',
        extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/eslint-recommended',
            'plugin:@typescript-eslint/recommended',
        ],
        globals: { Buffer: true },
    },
});
const tmpdir = os_1.default.tmpdir();
function createHash(s) {
    return crypto_1.default.createHash('sha256').update(s).digest('hex');
}
function deepLog(obj) {
    console.log((0, util_1.inspect)(obj, { depth: 15, colors: true }));
}
exports.deepLog = deepLog;
async function analyzeCode(ts) {
    const hash = createHash(Buffer.from(ts));
    const filename = `${hash}.ts`;
    const filePath = path_1.default.join(tmpdir, filename);
    await fs_1.promises.writeFile(filePath, ts, 'utf8');
    const outfilePath = `${filePath}.js`;
    const buildResult = await (0, esbuild_1.build)({
        absWorkingDir: tmpdir,
        entryPoints: [filePath],
        outfile: outfilePath,
    });
    const js = await fs_1.promises.readFile(outfilePath, 'utf8');
    return {
        js,
        ts,
        errors: buildResult.errors,
        warnings: buildResult.warnings,
    };
}
exports.analyzeCode = analyzeCode;
exports.DEFAULT_VERIFY_IMPORTS_OPTS = {
    expectNoErrors: true,
    expectNoWarnings: true,
    logImports: false,
};
function importsFromCode(code) {
    return code
        .split('\n')
        .filter((x) => /^import .+ from/.test(x))
        .map(serdes_1.extractSerdePackageFromImportStatment)
        .filter((x) => x != null);
}
function verifyImports(t, analyzeCode, imports, opts = exports.DEFAULT_VERIFY_IMPORTS_OPTS) {
    opts = { ...exports.DEFAULT_VERIFY_IMPORTS_OPTS, ...opts };
    if (opts.expectNoErrors) {
        t.equal(analyzeCode.errors.length, 0, 'no errors');
    }
    if (opts.expectNoWarnings) {
        t.equal(analyzeCode.warnings.length, 0, 'no warnings');
    }
    const actual = importsFromCode(analyzeCode.ts);
    actual.sort();
    imports.sort();
    if (opts.logImports) {
        console.log({ imports: actual });
    }
    t.equal(actual.length, imports.length, 'imports count');
    (0, spok_1.default)(t, { ...actual, $topic: 'imports' }, imports);
}
exports.verifyImports = verifyImports;
async function verifySyntacticCorrectness(t, ts) {
    try {
        const results = await eslint.lintText(ts);
        for (const res of results) {
            if (res.errorCount > 0) {
                deepLog(res.messages.map((x) => `${x.message} at ${x.line}:${x.column} (${x.nodeType})`));
                t.fail(`Found ${res.errorCount} errors via esbuild`);
            }
        }
    }
    catch (err) {
        t.error(err);
    }
}
exports.verifySyntacticCorrectness = verifySyntacticCorrectness;
async function verifySyntacticCorrectnessForGeneratedDir(t, fullDirPath) {
    const rootName = path_1.default.dirname(fullDirPath).split(path_1.default.sep).pop();
    const files = await (0, recursive_readdir_1.default)(fullDirPath);
    for (const file of files) {
        t.comment(`+++ Syntactically checking ${path_1.default.relative(fullDirPath, file)} inside ${rootName}`);
        const ts = await fs_1.promises.readFile(file, 'utf8');
        await verifySyntacticCorrectness(t, ts);
    }
}
exports.verifySyntacticCorrectnessForGeneratedDir = verifySyntacticCorrectnessForGeneratedDir;
async function verifyTopLevelScript(t, file, relFile) {
    const cmd = `${esr} --cache ${file}`;
    try {
        await exec(cmd);
    }
    catch (err) {
        t.error(err, `running ${relFile}`);
    }
}
exports.verifyTopLevelScript = verifyTopLevelScript;
async function verifyTopLevelScriptForGeneratedDir(t, fullDirPath, indexFilesOnly = true) {
    let files = await (0, recursive_readdir_1.default)(fullDirPath);
    const rootName = path_1.default.dirname(fullDirPath).split(path_1.default.sep).pop();
    if (indexFilesOnly) {
        files = files.filter((x) => x.endsWith('index.ts'));
    }
    for (const file of files) {
        const relFile = path_1.default.relative(fullDirPath, file);
        t.comment(`+++ Running ${relFile} inside ${rootName}`);
        await verifyTopLevelScript(t, file, relFile);
    }
}
exports.verifyTopLevelScriptForGeneratedDir = verifyTopLevelScriptForGeneratedDir;
async function verifyWithTypescriptCompiler(t, fullDirPath) {
    try {
        await (0, tsc_1.verifyTypes)(fullDirPath);
        t.pass('Verifying types with tsc');
    }
    catch (err) {
        t.error(err, 'Verifying types with tsc');
    }
}
exports.verifyWithTypescriptCompiler = verifyWithTypescriptCompiler;
//# sourceMappingURL=verify-code.js.map