"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const check_idl_1 = require("../utils/check-idl");
const feat_account_padding_json_1 = __importDefault(require("./fixtures/feat-account-padding.json"));
const feat_aliases_json_1 = __importDefault(require("./fixtures/feat-aliases.json"));
const feat_data_enum_json_1 = __importDefault(require("./fixtures/feat-data-enum.json"));
const feat_fix_anchor_maps_json_1 = __importDefault(require("./fixtures/feat-fix-anchor-maps.json"));
const feat_mixed_enums_custom_types_json_1 = __importDefault(require("./fixtures/feat-mixed-enums+custom-types.json"));
const feat_mixed_enums_json_1 = __importDefault(require("./fixtures/feat-mixed-enums.json"));
const feat_tuples_json_1 = __importDefault(require("./fixtures/feat-tuples.json"));
const feat_sets_json_1 = __importDefault(require("./fixtures/feat-sets.json"));
const feat_collection_accounts_json_1 = __importDefault(require("./fixtures/feat-collection-accounts.json"));
const feat_optional_accounts_json_1 = __importDefault(require("./fixtures/feat-optional-accounts.json"));
// -----------------
// feat-account-padding
// -----------------
{
    const label = 'feat-account-padding';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_account_padding_json_1.default;
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// feat-aliases
// -----------------
{
    const label = 'feat-aliases';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const { comment, ...withoutComment } = feat_aliases_json_1.default;
        const idl = withoutComment;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label, {
            formatCode: true,
            typeAliases: { UnixTimestamp: 'i64' },
        });
    });
}
// -----------------
// feat-data-enum
// -----------------
{
    const label = 'feat-data-enum';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_data_enum_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// feat-fix-anchor-maps
// -----------------
{
    const label = 'feat-fix-anchor-maps';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_fix_anchor_maps_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// feat-mixed-enums+custom-types
// -----------------
{
    const label = 'feat-mixed-enums+custom-types';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_mixed_enums_custom_types_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// feat-mixed-enums
// -----------------
{
    const label = 'feat-mixed-enums';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_mixed_enums_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// feat-tuples
// -----------------
{
    const label = 'feat-tuples';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_tuples_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// feat-collections-accounts
// -----------------
{
    const label = 'feat-collections-accounts';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_collection_accounts_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// feat-sets
// -----------------
{
    const label = 'feat-sets';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_sets_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// feat-optional-accounts
// -----------------
{
    const label = 'feat-optional-accounts';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = feat_optional_accounts_json_1.default;
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
//# sourceMappingURL=features.js.map