"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const render_account_providers_1 = require("../src/render-account-providers");
function accountNamed(accName) {
    return {
        name: accName,
        type: {
            kind: 'struct',
            fields: [],
        },
    };
}
function includesAccount(t, code, accName) {
    const lines = code.split('\n');
    const exports = lines.pop();
    const imports = lines.join('\n');
    const importNeedle = `import { ${accName}`;
    t.ok(imports.includes(importNeedle), `imports ${accName}`);
    t.ok(exports.includes(accName), `exports ${accName}`);
}
(0, tape_1.default)('accountProviders: for zero accounts', (t) => {
    const code = (0, render_account_providers_1.renderAccountProviders)([]);
    t.equal(code.length, 0, 'renders no code');
    t.end();
});
(0, tape_1.default)('accountProviders: for one account', (t) => {
    const code = (0, render_account_providers_1.renderAccountProviders)([accountNamed('collectionAccount')]);
    includesAccount(t, code, 'CollectionAccount');
    t.end();
});
(0, tape_1.default)('accountProviders: for three accounts', (t) => {
    const code = (0, render_account_providers_1.renderAccountProviders)([
        accountNamed('collectionAccount'),
        accountNamed('data'),
        accountNamed('solitaMaker'),
    ]);
    includesAccount(t, code, 'CollectionAccount');
    includesAccount(t, code, 'Data');
    includesAccount(t, code, 'SolitaMaker');
    t.end();
});
//# sourceMappingURL=render-account-provider.js.map