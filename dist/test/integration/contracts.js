"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const tape_1 = __importDefault(require("tape"));
const check_idl_1 = require("../utils/check-idl");
const anchor_optional_json_1 = __importDefault(require("./fixtures/anchor-optional.json"));
const auction_house_1_1_4_anchor_0_24_2_json_1 = __importDefault(require("./fixtures/auction_house-1.1.4-anchor-0.24.2.json"));
const auction_house_json_1 = __importDefault(require("./fixtures/auction_house.json"));
const fanout_json_1 = __importDefault(require("./fixtures/fanout.json"));
const gumdrop_json_1 = __importDefault(require("./fixtures/gumdrop.json"));
const mpl_token_metadata_json_1 = __importDefault(require("./fixtures/mpl_token_metadata.json"));
const nft_candy_machine_v1_json_1 = __importDefault(require("./fixtures/nft_candy_machine_v1.json"));
const nft_packs_json_1 = __importDefault(require("./fixtures/nft-packs.json"));
const shank_tictactoe_json_1 = __importDefault(require("./fixtures/shank_tictactoe.json"));
const shank_token_metadata_json_1 = __importDefault(require("./fixtures/shank_token_metadata.json"));
const shank_token_vault_json_1 = __importDefault(require("./fixtures/shank_token_vault.json"));
// -----------------
// anchor-optional
// -----------------
{
    const label = 'anchor-optional';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = anchor_optional_json_1.default;
        idl.instructions.map(ix => {
            ix.defaultOptionalAccounts = true;
        });
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// ah-1.1.4-anchor-0.24.2
// -----------------
{
    const label = 'ah-1.1.4-anchor-0.24.2';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = auction_house_1_1_4_anchor_0_24_2_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// auction_house
// -----------------
{
    const label = 'auction_house';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = auction_house_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// fanout
// -----------------
{
    const label = 'fanout';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = fanout_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'A1BvUFMKzoubnHEFhvhJxXyTfEN6r2DqCZxJFF9hfH3x',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// gumdrop
// -----------------
{
    const label = 'gumdrop';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = gumdrop_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'gdrpGjVffourzkdDRrQmySw4aTHr8a3xmQzzxSwFD1a',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// mpl_token_metadata
// -----------------
{
    const label = 'mpl_token_metadata';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = mpl_token_metadata_json_1.default;
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// nft_candy_machine_v1
// -----------------
{
    const label = 'nft_candy_machine_v1';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = nft_candy_machine_v1_json_1.default;
        idl.metadata = {
            ...idl.metadata,
            address: 'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
        };
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// nft-packs
// -----------------
{
    const label = 'nft-packs';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = nft_packs_json_1.default;
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// shank-tictactoe
// -----------------
{
    const label = 'shank-tictactoe';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = shank_tictactoe_json_1.default;
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
// -----------------
// shank-token-metadata
// -----------------
{
    const label = 'shank-token-metadata';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = shank_token_metadata_json_1.default;
        const { generatedSDKDir } = await (0, check_idl_1.checkIdl)(t, idl, label);
        async function verifyCodeMatches(relPath, rx) {
            const fullPath = path_1.default.join(generatedSDKDir, relPath);
            const code = await fs_1.promises.readFile(fullPath, 'utf8');
            t.match(code, rx, `Code inside ${relPath} matches ${rx.toString()}`);
        }
        await verifyCodeMatches('types/Data.ts', /FixableBeetArgsStruct<\s*Data\s*>/);
        await verifyCodeMatches('instructions/CreateMetadataAccount.ts', /FixableBeetArgsStruct<\s*CreateMetadataAccountInstructionArgs/);
    });
}
// -----------------
// shank-token-vault
// -----------------
{
    const label = 'shank-token-vault';
    (0, tape_1.default)('renders type correct SDK for ' + label, async (t) => {
        const idl = shank_token_vault_json_1.default;
        await (0, check_idl_1.checkIdl)(t, idl, label);
    });
}
//# sourceMappingURL=contracts.js.map