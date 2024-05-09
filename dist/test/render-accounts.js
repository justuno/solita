"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const beet_1 = require("@metaplex-foundation/beet");
const tape_1 = __importDefault(require("tape"));
const render_account_1 = require("../src/render-account");
const serializers_1 = require("../src/serializers");
const type_mapper_1 = require("../src/type-mapper");
const types_1 = require("../src/types");
const verify_code_1 = require("./utils/verify-code");
const PROGRAM_ID = 'testprogram';
const DIAGNOSTIC_ON = false;
const ROOT_DIR = '/tmp/root';
const ACCOUNT_FILE_DIR = `${ROOT_DIR}/src/generated/accounts/account-uno.ts`;
async function checkRenderedAccount(t, account, imports, opts = {}) {
    var _a;
    const { logImports = DIAGNOSTIC_ON, logCode = DIAGNOSTIC_ON, serializers = serializers_1.CustomSerializers.empty, } = opts;
    const ts = (0, render_account_1.renderAccount)(account, ACCOUNT_FILE_DIR, new Map(), new Map(), new Map(), serializers, type_mapper_1.FORCE_FIXABLE_NEVER, PROGRAM_ID, (_) => null, (_a = opts.hasImplicitDiscriminator) !== null && _a !== void 0 ? _a : true);
    if (logCode) {
        console.log(`--------- <TypeScript> --------\n${ts}\n--------- </TypeScript> --------`);
    }
    (0, verify_code_1.verifySyntacticCorrectness)(t, ts);
    const analyzed = await (0, verify_code_1.analyzeCode)(ts);
    (0, verify_code_1.verifyImports)(t, analyzed, imports, { logImports });
    if (opts.rxs != null) {
        for (const rx of opts.rxs) {
            t.match(ts, rx, `TypeScript matches: ${rx.toString()}`);
        }
    }
    if (opts.nonrxs != null) {
        for (const rx of opts.nonrxs) {
            t.doesNotMatch(ts, rx, `TypeScript does not match: ${rx.toString()}`);
        }
    }
}
// TODO(thlorenz): Still renders args and causes compile issues
// An accounts without a field is very uncommon and thus this can be fixed later
tape_1.default.skip('accounts: no field', async (t) => {
    const account = {
        name: 'AuctionHouse',
        type: {
            kind: 'struct',
            fields: [],
        },
    };
    await checkRenderedAccount(t, account, [beet_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE]);
    t.end();
});
(0, tape_1.default)('accounts: one field', async (t) => {
    const account = {
        name: 'AuctionHouse',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'auctionHouseFeeAccount',
                    type: 'publicKey',
                },
            ],
        },
    };
    await checkRenderedAccount(t, account, [
        beet_1.BEET_PACKAGE,
        types_1.BEET_SOLANA_PACKAGE,
        types_1.SOLANA_WEB3_PACKAGE,
    ]);
    t.end();
});
(0, tape_1.default)('accounts: four fields', async (t) => {
    const account = {
        name: 'AuctionHouse',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'auctionHouseFeeAccount',
                    type: 'publicKey',
                },
                {
                    name: 'feePayerBump',
                    type: 'u8',
                },
                {
                    name: 'sellerFeeBasisPoints',
                    type: 'u16',
                },
                {
                    name: 'requiresSignOff',
                    type: 'bool',
                },
            ],
        },
    };
    await checkRenderedAccount(t, account, [
        beet_1.BEET_PACKAGE,
        types_1.BEET_SOLANA_PACKAGE,
        types_1.SOLANA_WEB3_PACKAGE,
    ]);
    t.end();
});
(0, tape_1.default)('accounts: pretty function for different types', async (t) => {
    const account = {
        name: 'AuctionHouse',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'auctionHouseFeeAccount',
                    type: 'publicKey',
                },
                {
                    name: 'feePayerBump',
                    type: 'u8',
                },
                {
                    name: 'someLargeNumber',
                    type: 'u64',
                },
            ],
        },
    };
    await checkRenderedAccount(t, account, [beet_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [
            /auctionHouseFeeAccount: this.auctionHouseFeeAccount.toBase58\(\)/,
            /const x = <{ toNumber: \(\) => number }>this.someLargeNumber/,
        ],
    });
    t.end();
});
(0, tape_1.default)('accounts: one field with custom serializers', async (t) => {
    const account = {
        name: 'AuctionHouse',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'auctionHouseFeeAccount',
                    type: 'publicKey',
                },
            ],
        },
    };
    const serializers = serializers_1.CustomSerializers.create(ROOT_DIR, new Map([['AuctionHouse', 'src/custom/serializer.ts']]));
    await checkRenderedAccount(t, account, [beet_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        serializers,
        rxs: [
            /import \* as customSerializer from '(\.\.\/){3}custom\/serializer'/i,
            /const resolvedSerialize = typeof serializer\.serialize === 'function'/,
            /\? serializer\.serialize\.bind\(serializer\)/,
            /\: auctionHouseBeet\.serialize\.bind\(auctionHouseBeet\)/i,
        ],
    });
    t.end();
});
// -----------------
// Padding
// -----------------
(0, tape_1.default)('accounts: one account with two fields, one has padding attr', async (t) => {
    const account = {
        name: 'StructAccountWithPadding',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'count',
                    type: 'u8',
                },
                {
                    name: 'padding',
                    type: {
                        array: ['u8', 3],
                    },
                    attrs: ['padding'],
                },
            ],
        },
    };
    await checkRenderedAccount(t, account, [beet_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [
            /readonly count\: number/,
            /count\: this\.count/,
            /args\.count/,
            /'padding', beet\.uniformFixedSizeArray\(beet\.u8, 3\)/,
            /padding\: Array\(3\).fill\(0\),/,
        ],
        nonrxs: [/readonly padding/, /padding\: this\.padding/, /args\.padding/],
    });
    t.end();
});
(0, tape_1.default)('accounts: one account with two fields without implicit discriminator, one has padding attr', async (t) => {
    const account = {
        name: 'StructAccountWithPadding',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'count',
                    type: 'u8',
                },
                {
                    name: 'padding',
                    type: {
                        array: ['u8', 3],
                    },
                    attrs: ['padding'],
                },
            ],
        },
    };
    await checkRenderedAccount(t, account, [beet_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [
            /readonly count\: number/,
            /args\.count/,
            /count\: this\.count/,
            /'padding', beet\.uniformFixedSizeArray\(beet\.u8, 3\)/,
            /padding\: Array\(3\).fill\(0\),/,
        ],
        nonrxs: [/readonly padding/, /padding\: this\.padding/, /args\.padding/],
        hasImplicitDiscriminator: false,
    });
    t.end();
});
(0, tape_1.default)('accounts: one account with three fields, middle one has padding attr', async (t) => {
    const account = {
        name: 'StructAccountWithPadding',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'count',
                    type: 'u8',
                },
                {
                    name: 'padding',
                    type: {
                        array: ['u8', 5],
                    },
                    attrs: ['padding'],
                },
                {
                    name: 'largerCount',
                    type: 'u64',
                },
            ],
        },
    };
    await checkRenderedAccount(t, account, [beet_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [
            /readonly count\: number/,
            /readonly largerCount\: beet.bignum/,
            /args\.count/,
            /args\.largerCount/,
            /count\: this\.count/,
            /largerCount\: /,
            /'padding', beet\.uniformFixedSizeArray\(beet\.u8, 5\)/,
            /padding\: Array\(5\).fill\(0\),/,
        ],
        nonrxs: [/readonly padding/, /padding\: this\.padding/, /args\.padding/],
    });
    t.end();
});
(0, tape_1.default)('accounts: one account with three fields, middle one has padding attr without implicitDiscriminator', async (t) => {
    const account = {
        name: 'StructAccountWithPadding',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'count',
                    type: 'u8',
                },
                {
                    name: 'padding',
                    type: {
                        array: ['u8', 5],
                    },
                    attrs: ['padding'],
                },
                {
                    name: 'largerCount',
                    type: 'u64',
                },
            ],
        },
    };
    await checkRenderedAccount(t, account, [beet_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        rxs: [
            /readonly count\: number/,
            /readonly largerCount\: beet.bignum/,
            /args\.count/,
            /args\.largerCount/,
            /count\: this\.count/,
            /largerCount\: /,
            /'padding', beet\.uniformFixedSizeArray\(beet\.u8, 5\)/,
            /padding\: Array\(5\).fill\(0\),/,
        ],
        nonrxs: [/readonly padding/, /padding\: this\.padding/, /args\.padding/],
        hasImplicitDiscriminator: false,
    });
    t.end();
});
//# sourceMappingURL=render-accounts.js.map