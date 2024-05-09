"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const check_idl_1 = require("../utils/check-idl");
const issue_empty_accounts_json_1 = __importDefault(require("./fixtures/issue-empty-accounts.json"));
const issue_missing_beet_import_json_1 = __importDefault(require("./fixtures/issue-missing-beet-import.json"));
// -----------------
// issue-empty-accounts
// -----------------
{
    const label = 'issue-empty-accounts';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = issue_empty_accounts_json_1.default;
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// issue-missing-beet-import
// -----------------
{
    const label = 'issue-missing-beet-import';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = issue_missing_beet_import_json_1.default;
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
//# sourceMappingURL=issues.js.map