"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const render_type_1 = require("../src/render-type");
const type_mapper_1 = require("../src/type-mapper");
const types_1 = require("../src/types");
const verify_code_1 = require("./utils/verify-code");
const DIAGNOSTIC_ON = false;
const TYPE_FILE_DIR = '/root/app/instructions/';
async function checkRenderedType(t, ty, imports, opts = { logImports: DIAGNOSTIC_ON, logCode: DIAGNOSTIC_ON }) {
    const ts = (0, render_type_1.renderType)(ty, TYPE_FILE_DIR, new Map(), new Map([
        ['InitPackSetArgs', '/module/of/init-pack-set-args.ts'],
        ['AddCardToPackArgs', '/module/of/add-cart-to-pack-args.ts'],
        ['Creator', '/module/of/creator.ts'],
    ]), new Map(), type_mapper_1.FORCE_FIXABLE_NEVER);
    if (opts.logCode) {
        console.log(`--------- <TypeScript> --------\n${ts.code}\n--------- </TypeScript> --------`);
    }
    (0, verify_code_1.verifySyntacticCorrectness)(t, ts.code);
    const analyzed = await (0, verify_code_1.analyzeCode)(ts.code);
    (0, verify_code_1.verifyImports)(t, analyzed, imports, { logImports: opts.logImports });
}
(0, tape_1.default)('types: with one field not using lib types', async (t) => {
    const ty = {
        name: 'CandyMachineData',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'uuid',
                    type: 'string',
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE]);
    t.end();
});
(0, tape_1.default)('types: with three, two lib types', async (t) => {
    const ty = {
        name: 'CandyMachineData',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'uuid',
                    type: 'string',
                },
                {
                    name: 'itemsAvailable',
                    type: 'u64',
                },
                {
                    name: 'goLiveDate',
                    type: {
                        option: 'i64',
                    },
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE]);
    t.end();
});
(0, tape_1.default)('types: with four fields, one referring to other defined type', async (t) => {
    const ty = {
        name: 'ConfigData',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'uuid',
                    type: 'string',
                },
                {
                    name: 'creators',
                    type: {
                        vec: {
                            defined: 'Creator',
                        },
                    },
                },
                {
                    name: 'maxSupply',
                    type: 'u64',
                },
                {
                    name: 'isMutable',
                    type: 'bool',
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE]);
    t.end();
});
(0, tape_1.default)('types: enum with inline data', async (t) => {
    const ty = {
        name: 'CollectionInfo',
        type: {
            kind: 'enum',
            variants: [
                {
                    name: 'V1',
                    fields: [
                        {
                            name: 'symbol',
                            type: 'string',
                        },
                        {
                            name: 'verified_creators',
                            type: {
                                vec: 'publicKey',
                            },
                        },
                        {
                            name: 'whitelist_root',
                            type: {
                                array: ['u8', 32],
                            },
                        },
                    ],
                },
                {
                    name: 'V2',
                    fields: [
                        {
                            name: 'collection_mint',
                            type: 'publicKey',
                        },
                    ],
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        logImports: false,
    });
});
(0, tape_1.default)('types: data enum with unnamed fields variant', async (t) => {
    const ty = {
        name: 'CleanUpActions',
        type: {
            kind: 'enum',
            variants: [
                {
                    name: 'Change',
                    fields: ['u32', 'u32'],
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE], {
        logCode: false,
        logImports: false,
    });
});
(0, tape_1.default)('types: data enum with unnamed and named fields variants', async (t) => {
    const ty = {
        name: 'CleanUpActions',
        type: {
            kind: 'enum',
            variants: [
                {
                    name: 'Unnamed',
                    fields: ['u32', 'u32'],
                },
                {
                    name: 'Named',
                    fields: [
                        {
                            name: 'collection_mint',
                            type: 'publicKey',
                        },
                    ],
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        logImports: false,
    });
});
(0, tape_1.default)('types: enum with only scalar variants', async (t) => {
    const ty = {
        name: 'CleanUpActions',
        type: {
            kind: 'enum',
            variants: [
                {
                    name: 'Uno',
                },
                {
                    name: 'Dos',
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE], {
        logCode: true,
        logImports: false,
    });
});
(0, tape_1.default)('types: enum data and scalar variants', async (t) => {
    const ty = {
        name: 'CleanUpActions',
        type: {
            kind: 'enum',
            variants: [
                {
                    name: 'Data',
                    fields: [
                        {
                            name: 'dataField',
                            type: 'u16',
                        },
                    ],
                },
                {
                    name: 'Scalar',
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE], {
        logCode: false,
        logImports: false,
    });
});
(0, tape_1.default)('types: data enum with custom types', async (t) => {
    const ty = {
        name: 'CleanUpActions',
        type: {
            kind: 'enum',
            variants: [
                {
                    name: 'InitPack',
                    fields: [
                        {
                            defined: 'InitPackSetArgs',
                        },
                    ],
                },
                {
                    name: 'AddCardToPack',
                    fields: [
                        {
                            defined: 'AddCardToPackArgs',
                        },
                    ],
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE], {
        logCode: false,
        logImports: false,
    });
});
// -----------------
// Maps
// -----------------
//
(0, tape_1.default)('types: BTreeMap<u32, u32>', async (t) => {
    const ty = {
        name: 'ProvingProcess',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'cardsToRedeem',
                    type: {
                        bTreeMap: ['u32', 'u32'],
                    },
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE], {
        logCode: false,
        logImports: false,
    });
});
(0, tape_1.default)('types: HashMap<string, AddCardToPackArgs>', async (t) => {
    const ty = {
        name: 'ProvingProcess',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'map',
                    type: {
                        hashMap: [
                            'string',
                            {
                                defined: 'AddCardToPackArgs',
                            },
                        ],
                    },
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE], {
        logCode: false,
        logImports: false,
    });
});
(0, tape_1.default)('types: Vec<HashMap<string, u32>>', async (t) => {
    const ty = {
        name: 'ProvingProcess',
        type: {
            kind: 'struct',
            fields: [
                {
                    name: 'maps',
                    type: {
                        vec: {
                            hashMap: ['string', 'u32'],
                        },
                    },
                },
            ],
        },
    };
    await checkRenderedType(t, ty, [types_1.BEET_PACKAGE], {
        logCode: true,
        logImports: false,
    });
});
//# sourceMappingURL=render-type.js.map