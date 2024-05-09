"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solita = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const render_account_1 = require("./render-account");
const render_errors_1 = require("./render-errors");
const render_instruction_1 = require("./render-instruction");
const render_type_1 = require("./render-type");
const assert_1 = require("assert");
const types_1 = require("./types");
const utils_1 = require("./utils");
const prettier_1 = require("prettier");
const paths_1 = require("./paths");
const serializers_1 = require("./serializers");
const render_account_providers_1 = require("./render-account-providers");
const transform_type_1 = require("./transform-type");
__exportStar(require("./types"), exports);
const DEFAULT_FORMAT_OPTS = {
    semi: false,
    singleQuote: true,
    trailingComma: 'es5',
    useTabs: false,
    tabWidth: 2,
    arrowParens: 'always',
    printWidth: 80,
    parser: 'typescript',
};
class Solita {
    constructor(idl, { formatCode = false, formatOpts = {}, prependGeneratedWarning = true, typeAliases = {}, serializers = {}, projectRoot = process.cwd(), anchorRemainingAccounts, } = {}) {
        this.idl = idl;
        this.resolveFieldType = (typeName) => {
            var _a, _b;
            for (const acc of (_a = this.idl.accounts) !== null && _a !== void 0 ? _a : []) {
                if (acc.name === typeName)
                    return acc.type;
            }
            for (const def of (_b = this.idl.types) !== null && _b !== void 0 ? _b : []) {
                if (def.name === typeName)
                    return def.type;
            }
            return null;
        };
        this.projectRoot = projectRoot;
        this.formatCode = formatCode;
        this.formatOpts = { ...DEFAULT_FORMAT_OPTS, ...formatOpts };
        this.prependGeneratedWarning = prependGeneratedWarning;
        this.accountsHaveImplicitDiscriminator = !(0, types_1.isShankIdl)(idl);
        this.typeAliases = new Map(Object.entries(typeAliases));
        this.serializers = serializers_1.CustomSerializers.create(this.projectRoot, new Map(Object.entries(serializers)));
        this.hasInstructions = idl.instructions.length > 0;
        // Unless remaining accounts are specifically turned off, we support them
        // for anchor programs
        this.anchorRemainingAccounts = anchorRemainingAccounts !== null && anchorRemainingAccounts !== void 0 ? anchorRemainingAccounts : (0, types_1.isAnchorIdl)(idl);
    }
    // -----------------
    // Extract
    // -----------------
    accountFilesByType() {
        var _a, _b;
        (0, assert_1.strict)(this.paths != null, 'should have set paths');
        return new Map((_b = (_a = this.idl.accounts) === null || _a === void 0 ? void 0 : _a.map((x) => [
            x.name,
            this.paths.accountFile(x.name),
        ])) !== null && _b !== void 0 ? _b : []);
    }
    customFilesByType() {
        var _a, _b;
        (0, assert_1.strict)(this.paths != null, 'should have set paths');
        return new Map((_b = (_a = this.idl.types) === null || _a === void 0 ? void 0 : _a.map((x) => [x.name, this.paths.typeFile(x.name)])) !== null && _b !== void 0 ? _b : []);
    }
    // -----------------
    // Render
    // -----------------
    renderCode() {
        var _a, _b, _c, _d, _e, _f;
        (0, assert_1.strict)(this.paths != null, 'should have set paths');
        const programId = this.idl.metadata.address;
        const fixableTypes = new Set();
        const accountFiles = this.accountFilesByType();
        const customFiles = this.customFilesByType();
        function forceFixable(ty) {
            if ((0, types_1.isIdlTypeDefined)(ty) && fixableTypes.has(ty.defined)) {
                return true;
            }
            return false;
        }
        // NOTE: we render types first in order to know which ones are 'fixable' by
        // the time we render accounts and instructions
        // However since types may depend on other types we obtain this info in 2 passes.
        // -----------------
        // Types
        // -----------------
        const types = {};
        (0, utils_1.logDebug)('Rendering %d types', (_b = (_a = this.idl.types) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
        (0, transform_type_1.adaptIdl)(this.idl);
        if (this.idl.types != null) {
            for (let ty of this.idl.types) {
                // Here we detect if the type itself is fixable solely based on its
                // primitive field types
                let isFixable = (0, render_type_1.determineTypeIsFixable)(ty, this.paths.typesDir, accountFiles, customFiles);
                if (isFixable) {
                    fixableTypes.add(ty.name);
                }
            }
            for (const ty of this.idl.types) {
                (0, utils_1.logDebug)(`Rendering type ${ty.name}`);
                (0, utils_1.logTrace)('kind: %s', ty.type.kind);
                if ((0, types_1.isIdlFieldsType)(ty.type)) {
                    (0, utils_1.logTrace)('fields: %O', ty.type.fields);
                }
                else {
                    if ((0, types_1.isIdlTypeEnum)(ty.type)) {
                        (0, utils_1.logTrace)('variants: %O', ty.type.variants);
                    }
                }
                let { code, isFixable } = (0, render_type_1.renderType)(ty, this.paths.typesDir, accountFiles, customFiles, this.typeAliases, forceFixable);
                // If the type by itself does not need to be fixable, here we detect if
                // it needs to be fixable due to including a fixable type
                if (isFixable) {
                    fixableTypes.add(ty.name);
                }
                if (this.prependGeneratedWarning) {
                    code = (0, utils_1.prependGeneratedWarning)(code);
                }
                if (this.formatCode) {
                    try {
                        code = (0, prettier_1.format)(code, this.formatOpts);
                    }
                    catch (err) {
                        (0, utils_1.logError)(`Failed to format ${ty.name} instruction`);
                        (0, utils_1.logError)(err);
                    }
                }
                types[ty.name] = code;
            }
        }
        // -----------------
        // Instructions
        // -----------------
        const instructions = {};
        for (const ix of this.idl.instructions) {
            (0, utils_1.logDebug)(`Rendering instruction ${ix.name}`);
            (0, utils_1.logTrace)('args: %O', ix.args);
            (0, utils_1.logTrace)('accounts: %O', ix.accounts);
            let code = (0, render_instruction_1.renderInstruction)(ix, this.paths.instructionsDir, programId, accountFiles, customFiles, this.typeAliases, forceFixable, this.anchorRemainingAccounts);
            if (this.prependGeneratedWarning) {
                code = (0, utils_1.prependGeneratedWarning)(code);
            }
            if (this.formatCode) {
                try {
                    code = (0, prettier_1.format)(code, this.formatOpts);
                }
                catch (err) {
                    (0, utils_1.logError)(`Failed to format ${ix.name} instruction`);
                    (0, utils_1.logError)(err);
                }
            }
            instructions[ix.name] = code;
        }
        // -----------------
        // Accounts
        // -----------------
        const accounts = {};
        for (const account of (_c = this.idl.accounts) !== null && _c !== void 0 ? _c : []) {
            (0, utils_1.logDebug)(`Rendering account ${account.name}`);
            (0, utils_1.logTrace)('type: %O', account.type);
            let code = (0, render_account_1.renderAccount)(account, this.paths.accountsDir, accountFiles, customFiles, this.typeAliases, this.serializers, forceFixable, programId, this.resolveFieldType, this.accountsHaveImplicitDiscriminator);
            if (this.prependGeneratedWarning) {
                code = (0, utils_1.prependGeneratedWarning)(code);
            }
            if (this.formatCode) {
                try {
                    code = (0, prettier_1.format)(code, this.formatOpts);
                }
                catch (err) {
                    (0, utils_1.logError)(`Failed to format ${account.name} account`);
                    (0, utils_1.logError)(err);
                }
            }
            accounts[account.name] = code;
        }
        // -----------------
        // Errors
        // -----------------
        (0, utils_1.logDebug)('Rendering %d errors', (_e = (_d = this.idl.errors) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0);
        let errors = (0, render_errors_1.renderErrors)((_f = this.idl.errors) !== null && _f !== void 0 ? _f : []);
        if (errors != null && this.prependGeneratedWarning) {
            errors = (0, utils_1.prependGeneratedWarning)(errors);
        }
        if (errors != null && this.formatCode) {
            try {
                errors = (0, prettier_1.format)(errors, this.formatOpts);
            }
            catch (err) {
                (0, utils_1.logError)(`Failed to format errors`);
                (0, utils_1.logError)(err);
            }
        }
        return { instructions, accounts, types, errors };
    }
    async renderAndWriteTo(outputDir) {
        this.paths = new paths_1.Paths(outputDir);
        const { instructions, accounts, types, errors } = this.renderCode();
        const reexports = [];
        if (this.hasInstructions) {
            reexports.push('instructions');
            await this.writeInstructions(instructions);
        }
        if (Object.keys(accounts).length !== 0) {
            reexports.push('accounts');
            await this.writeAccounts(accounts);
        }
        if (Object.keys(types).length !== 0) {
            reexports.push('types');
            await this.writeTypes(types);
        }
        if (errors != null) {
            reexports.push('errors');
            await this.writeErrors(errors);
        }
        await this.writeMainIndex(reexports);
    }
    // -----------------
    // Instructions
    // -----------------
    async writeInstructions(instructions) {
        (0, assert_1.strict)(this.paths != null, 'should have set paths');
        await (0, utils_1.prepareTargetDir)(this.paths.instructionsDir);
        (0, utils_1.logInfo)('Writing instructions to directory: %s', this.paths.relInstructionsDir);
        for (const [name, code] of Object.entries(instructions)) {
            (0, utils_1.logDebug)('Writing instruction: %s', name);
            await fs_1.promises.writeFile(this.paths.instructionFile(name), code, 'utf8');
        }
        (0, utils_1.logDebug)('Writing index.ts exporting all instructions');
        const indexCode = this.renderImportIndex(Object.keys(instructions).sort(), 'instructions');
        await fs_1.promises.writeFile(this.paths.instructionFile('index'), indexCode, 'utf8');
    }
    // -----------------
    // Accounts
    // -----------------
    async writeAccounts(accounts) {
        (0, assert_1.strict)(this.paths != null, 'should have set paths');
        await (0, utils_1.prepareTargetDir)(this.paths.accountsDir);
        (0, utils_1.logInfo)('Writing accounts to directory: %s', this.paths.relAccountsDir);
        for (const [name, code] of Object.entries(accounts)) {
            (0, utils_1.logDebug)('Writing account: %s', name);
            await fs_1.promises.writeFile(this.paths.accountFile(name), code, 'utf8');
        }
        (0, utils_1.logDebug)('Writing index.ts exporting all accounts');
        const accountProvidersCode = (0, render_account_providers_1.renderAccountProviders)(this.idl.accounts);
        const indexCode = this.renderImportIndex(Object.keys(accounts).sort(), 'accounts', accountProvidersCode);
        await fs_1.promises.writeFile(this.paths.accountFile('index'), indexCode, 'utf8');
    }
    // -----------------
    // Types
    // -----------------
    async writeTypes(types) {
        (0, assert_1.strict)(this.paths != null, 'should have set paths');
        await (0, utils_1.prepareTargetDir)(this.paths.typesDir);
        (0, utils_1.logInfo)('Writing types to directory: %s', this.paths.relTypesDir);
        for (const [name, code] of Object.entries(types)) {
            (0, utils_1.logDebug)('Writing type: %s', name);
            await fs_1.promises.writeFile(this.paths.typeFile(name), code, 'utf8');
        }
        (0, utils_1.logDebug)('Writing index.ts exporting all types');
        const reexports = Object.keys(types);
        // NOTE: this allows account types to be referenced via `defined.<AccountName>`, however
        // it would break if we have an account used that way, but no types
        // If that occurs we need to generate the `types/index.ts` just reexporting accounts
        const indexCode = this.renderImportIndex(reexports.sort(), 'types');
        await fs_1.promises.writeFile(this.paths.typeFile('index'), indexCode, 'utf8');
    }
    // -----------------
    // Errors
    // -----------------
    async writeErrors(errorsCode) {
        (0, assert_1.strict)(this.paths != null, 'should have set paths');
        await (0, utils_1.prepareTargetDir)(this.paths.errorsDir);
        (0, utils_1.logInfo)('Writing errors to directory: %s', this.paths.relErrorsDir);
        (0, utils_1.logDebug)('Writing index.ts containing all errors');
        await fs_1.promises.writeFile(this.paths.errorFile('index'), errorsCode, 'utf8');
    }
    // -----------------
    // Main Index File
    // -----------------
    async writeMainIndex(reexports) {
        (0, assert_1.strict)(this.paths != null, 'should have set paths');
        const programAddress = this.idl.metadata.address;
        const reexportCode = this.renderImportIndex(reexports.sort(), 'main');
        const imports = `import { PublicKey } from '${types_1.SOLANA_WEB3_PACKAGE}'`;
        const programIdConsts = `
/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = '${programAddress}'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
`;
        let code = `
${imports}
${reexportCode}
${programIdConsts}
`.trim();
        if (this.formatCode) {
            try {
                code = (0, prettier_1.format)(code, this.formatOpts);
            }
            catch (err) {
                (0, utils_1.logError)(`Failed to format mainIndex`);
                (0, utils_1.logError)(err);
            }
        }
        await fs_1.promises.writeFile(path_1.default.join(this.paths.root, `index.ts`), code, 'utf8');
    }
    renderImportIndex(modules, label, extraContent) {
        let code = modules.map((x) => `export * from './${x}';`).join('\n');
        if (extraContent != null) {
            code += `\n\n${extraContent}`;
        }
        if (this.formatCode) {
            try {
                code = (0, prettier_1.format)(code, this.formatOpts);
            }
            catch (err) {
                (0, utils_1.logError)(`Failed to format ${label} imports`);
                (0, utils_1.logError)(err);
            }
        }
        return code;
    }
}
exports.Solita = Solita;
//# sourceMappingURL=solita.js.map