"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTypes = void 0;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const pkg_dir_1 = __importDefault(require("pkg-dir"));
const child_process_1 = require("child_process");
const config = {
    compilerOptions: {
        target: 'ES2018',
        module: 'commonjs',
        baseUrl: './',
        sourceMap: false,
        declaration: true,
        declarationMap: false,
        noEmit: true,
        preserveWatchOutput: true,
        emitDeclarationOnly: false,
        importHelpers: false,
        strict: true,
        noUnusedLocals: true,
        noFallthroughCasesInSwitch: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        incremental: false,
        types: ['node'],
        moduleResolution: 'node',
        noImplicitReturns: true,
        skipLibCheck: true,
        resolveJsonModule: false,
    },
    include: ['generated'],
};
async function resolveBin(bin) {
    const root = (await (0, pkg_dir_1.default)());
    return path_1.default.join(root, 'node_modules', '.bin', bin);
}
async function writeTsconfig(parentToGeneratedDir) {
    const tsconfigPath = path_1.default.join(parentToGeneratedDir, 'tsconfig.json');
    await (0, promises_1.writeFile)(tsconfigPath, JSON.stringify(config, null, 2));
}
async function verifyTypes(fullPathToGeneratedDir) {
    const parent = path_1.default.dirname(fullPathToGeneratedDir);
    await writeTsconfig(parent);
    const args = ['-p', 'tsconfig.json'];
    const tscExecutable = await resolveBin('tsc');
    // const cmd = `${tscExecutable} ${args.join(' ')}`
    return new Promise((resolve, reject) => {
        let loggedFailure = false;
        let failures = Buffer.from('');
        const tsc = (0, child_process_1.spawn)(tscExecutable, args, { cwd: parent })
            .on('error', (err) => {
            reject(err);
        })
            .on('exit', () => {
            return loggedFailure
                ? reject(new Error(failures.toString('utf8')))
                : resolve();
        });
        tsc.stdout.on('data', (buf) => {
            loggedFailure = true;
            failures = Buffer.concat([failures, buf]);
        });
        tsc.stderr.on('data', (buf) => {
            process.stderr.write(buf);
        });
    });
}
exports.verifyTypes = verifyTypes;
//# sourceMappingURL=tsc.js.map