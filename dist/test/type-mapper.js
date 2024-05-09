"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const spok_1 = __importDefault(require("spok"));
const type_mapper_1 = require("../src/type-mapper");
const types_1 = require("../src/types");
const helpers_1 = require("./utils/helpers");
const SOME_FILE_DIR = '/root/app/';
// -----------------
// Primitive Types
// -----------------
(0, tape_1.default)('type-mapper: primitive types - numbers', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    const types = ['i8', 'u32', 'i16'];
    for (const n of types) {
        const ty = tm.map(n);
        t.equal(ty, 'number', `'${n}' maps to '${ty}' TypeScript type`);
    }
    t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    tm.clearUsages();
    for (const n of types) {
        const serde = tm.mapSerde(n);
        t.equal(serde, `beet.${n}`, `'${n}' maps to '${serde}' serde`);
    }
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_PACKAGE],
    });
    t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    t.end();
});
(0, tape_1.default)('type-mapper: primitive types - bignums', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    const types = ['i64', 'u128', 'i256', 'u512'];
    for (const n of types) {
        const ty = tm.map(n);
        t.equal(ty, 'beet.bignum', `'${n}' maps to '${ty}' TypeScript type`);
    }
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_PACKAGE],
    });
    t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    tm.clearUsages();
    for (const n of types) {
        const serde = tm.mapSerde(n);
        t.equal(serde, `beet.${n}`, `'${n}' maps to '${serde}' serde`);
    }
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_PACKAGE],
    });
    t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    t.end();
});
(0, tape_1.default)('type-mapper: primitive types - string', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    const ty = tm.map('string');
    t.equal(ty, 'string', 'string type');
    t.equal(tm.serdePackagesUsed.size, 0, 'no serdePackagesUsed');
    t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    tm.clearUsages();
    const serde = tm.mapSerde('string');
    t.equal(serde, 'beet.utf8String', 'string serde');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_PACKAGE],
    });
    t.ok(tm.usedFixableSerde, 'used fixable serde');
    t.end();
});
// -----------------
// Enums Scalar
// -----------------
(0, tape_1.default)('type-mapper: enums scalar', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    const enumType = {
        kind: 'enum',
        variants: [
            {
                name: 'Wallet',
            },
            {
                name: 'Token',
            },
            {
                name: 'NFT',
            },
        ],
    };
    {
        t.comment('+++ not providing name when mapping type and serde');
        tm.clearUsages();
        try {
            tm.map(enumType);
            t.fail('should fail due to missing name');
        }
        catch (err) {
            t.match(err.message, /provide name for enum types/i);
        }
        try {
            tm.mapSerde(enumType);
            t.fail('should fail due to missing name');
        }
        catch (err) {
            t.match(err.message, /provide name for enum types/i);
        }
    }
    {
        t.comment('+++ providing name when mapping type and serde');
        tm.clearUsages();
        const ty = tm.map(enumType, 'MembershipModel');
        t.equal(ty, 'MembershipModel', 'name as type');
        t.equal(tm.serdePackagesUsed.size, 0, 'no serdePackagesUsed');
        (0, spok_1.default)(t, Array.from(tm.scalarEnumsUsed), {
            $topic: 'scalarEnumsUsed',
            ...[['MembershipModel', ['Wallet', 'Token', 'NFT']]],
        });
        t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        tm.clearUsages();
        const serde = tm.mapSerde(enumType, 'MembershipModel');
        t.equal(serde, 'beet.fixedScalarEnum(MembershipModel)', 'serde');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        (0, spok_1.default)(t, Array.from(tm.scalarEnumsUsed), {
            $topic: 'scalarEnumsUsed',
            ...[['MembershipModel', ['Wallet', 'Token', 'NFT']]],
        });
        t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    }
    t.end();
});
// -----------------
// Composites Option
// -----------------
(0, tape_1.default)('type-mapper: composite types - option<number | bignum>', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    {
        const type = {
            option: 'u16',
        };
        const ty = tm.map(type);
        t.equal(ty, 'beet.COption<number>', 'option<u16>');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        tm.clearUsages();
        const serde = tm.mapSerde(type);
        t.equal(serde, 'beet.coption(beet.u16)', 'option<u16> serde');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        t.ok(tm.usedFixableSerde, 'used fixable serde');
    }
    {
        tm.clearUsages();
        const type = {
            option: 'u64',
        };
        const ty = tm.map(type);
        t.equal(ty, 'beet.COption<beet.bignum>', 'option<u64>');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        tm.clearUsages();
        const serde = tm.mapSerde(type);
        t.equal(serde, 'beet.coption(beet.u64)', 'option<u64> serde');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        t.ok(tm.usedFixableSerde, 'used fixable serde');
    }
    t.end();
});
// -----------------
// Composites Vec
// -----------------
(0, tape_1.default)('type-mapper: composite types - vec<number | bignum>', (t) => {
    {
        const tm = new type_mapper_1.TypeMapper();
        const type = {
            vec: 'u16',
        };
        const ty = tm.map(type);
        t.equal(ty, 'number[]', 'vec<u16>');
        t.equal(tm.serdePackagesUsed.size, 0, 'no serdePackagesUsed');
        tm.clearUsages();
        const serde = tm.mapSerde(type);
        t.equal(serde, 'beet.array(beet.u16)', 'vec<u16> serde');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        t.ok(tm.usedFixableSerde, 'used fixable serde');
    }
    {
        const tm = new type_mapper_1.TypeMapper();
        const type = {
            vec: 'u64',
        };
        const ty = tm.map(type);
        t.equal(ty, 'beet.bignum[]', 'vec<u64>');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        tm.clearUsages();
        const serde = tm.mapSerde(type);
        t.equal(serde, 'beet.array(beet.u64)', 'vec<u64> serde');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        t.ok(tm.usedFixableSerde, 'used fixable serde');
    }
    t.end();
});
// -----------------
// Composites Sized Array
// -----------------
(0, tape_1.default)('type-mapper: composite types - array<number>', (t) => {
    {
        const tm = new type_mapper_1.TypeMapper();
        const type = {
            array: ['u16', 4],
        };
        const ty = tm.map(type);
        t.equal(ty, 'number[] /* size: 4 */', 'array<u16>(4)');
        t.equal(tm.serdePackagesUsed.size, 0, 'no serdePackagesUsed');
        tm.clearUsages();
        const serde = tm.mapSerde(type);
        t.equal(serde, 'beet.uniformFixedSizeArray(beet.u16, 4)', 'array<u16>(4) serde');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    }
    t.end();
});
// -----------------
// Composites User Defined
// -----------------
(0, tape_1.default)('type-mapper: composite types - user defined', (t) => {
    const tm = new type_mapper_1.TypeMapper(new Map(), new Map([['ConfigData', '/module/of/config-data.ts']]));
    const type = {
        defined: 'ConfigData',
    };
    const ty = tm.map(type);
    t.equal(ty, 'ConfigData');
    t.equal(tm.serdePackagesUsed.size, 0, 'no serde packages used');
    (0, spok_1.default)(t, Array.from(tm.localImportsByPath), {
        $topic: 'local imports',
        ...[['/module/of/config-data.ts', new Set(['ConfigData'])]],
    });
    tm.clearUsages();
    const serde = tm.mapSerde(type);
    t.equal(serde, 'configDataBeet');
    t.equal(tm.serdePackagesUsed.size, 0, 'no serde packages used');
    (0, spok_1.default)(t, Array.from(tm.localImportsByPath), {
        $topic: 'local imports',
        ...[['/module/of/config-data.ts', new Set(['configDataBeet'])]],
    });
    t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    t.end();
});
// -----------------
// Extensions
// -----------------
(0, tape_1.default)('type-mapper: type extensions - publicKey', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    const ty = tm.map('publicKey');
    t.equal(ty, 'web3.PublicKey', 'publicKey');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.SOLANA_WEB3_PACKAGE],
    });
    tm.clearUsages();
    const serde = tm.mapSerde('publicKey');
    t.equal(serde, 'beetSolana.publicKey', 'publicKey serde');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_SOLANA_PACKAGE],
    });
    t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    t.end();
});
// -----------------
// Composites Multilevel
// -----------------
(0, tape_1.default)('type-mapper: composite with type extensions - publicKey', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    const type = {
        option: 'publicKey',
    };
    const ty = tm.map(type);
    t.equal(ty, 'beet.COption<web3.PublicKey>', 'option<publicKey>');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.SOLANA_WEB3_PACKAGE, types_1.BEET_PACKAGE],
    });
    tm.clearUsages();
    const serde = tm.mapSerde(type);
    t.equal(serde, 'beet.coption(beetSolana.publicKey)', 'option<publicKey> serde');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_SOLANA_PACKAGE, types_1.BEET_PACKAGE],
    });
    t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    t.ok(tm.usedFixableSerde, 'used fixable serde');
    t.end();
});
(0, tape_1.default)('type-mapper: composite types multilevel - option<option<number>>', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    const type = {
        option: {
            option: 'u64',
        },
    };
    const ty = tm.map(type);
    t.equal(ty, 'beet.COption<beet.COption<beet.bignum>>');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_PACKAGE],
    });
    tm.clearUsages();
    const serde = tm.mapSerde(type);
    t.equal(serde, 'beet.coption(beet.coption(beet.u64))');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_PACKAGE],
    });
    t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    t.ok(tm.usedFixableSerde, 'used fixable serde');
    t.end();
});
(0, tape_1.default)('type-mapper: composite types multilevel - option<option<publicKey>>', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    const type = {
        option: {
            option: 'publicKey',
        },
    };
    const ty = tm.map(type);
    t.equal(ty, 'beet.COption<beet.COption<web3.PublicKey>>');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.SOLANA_WEB3_PACKAGE, types_1.BEET_PACKAGE],
    });
    tm.clearUsages();
    const serde = tm.mapSerde(type);
    t.equal(serde, 'beet.coption(beet.coption(beetSolana.publicKey))');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_SOLANA_PACKAGE, types_1.BEET_PACKAGE],
    });
    t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    t.ok(tm.usedFixableSerde, 'used fixable serde');
    t.end();
});
(0, tape_1.default)('type-mapper: composite types multilevel - vec<option<ConfigData>>', (t) => {
    const tm = new type_mapper_1.TypeMapper(new Map(), new Map([['ConfigData', '/module/of/config-data.ts']]));
    const type = {
        vec: {
            option: {
                defined: 'ConfigData',
            },
        },
    };
    const ty = tm.map(type);
    t.equal(ty, 'beet.COption<ConfigData>[]');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_PACKAGE],
    });
    (0, spok_1.default)(t, Array.from(tm.localImportsByPath), {
        $topic: 'local imports',
        ...[['/module/of/config-data.ts', new Set(['ConfigData'])]],
    });
    tm.clearUsages();
    const serde = tm.mapSerde(type);
    t.equal(serde, 'beet.array(beet.coption(configDataBeet))');
    (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
        $topic: 'serdePackagesUsed',
        ...[types_1.BEET_PACKAGE],
    });
    (0, spok_1.default)(t, Array.from(tm.localImportsByPath), {
        $topic: 'local imports',
        ...[['/module/of/config-data.ts', new Set(['configDataBeet'])]],
    });
    t.ok(tm.usedFixableSerde, 'used fixable serde');
    t.end();
});
// -----------------
// Map Serde Fields
// -----------------
(0, tape_1.default)('type-mapper: serde fields', (t) => {
    const u16 = { name: 'u16', type: 'u16' };
    const configData = {
        name: 'configData',
        type: {
            defined: 'ConfigData',
        },
    };
    const optionPublicKey = {
        name: 'optionPublicKey',
        type: {
            option: 'publicKey',
        },
    };
    const vecOptionConfigData = {
        name: 'vecOptionConfigData',
        type: {
            vec: {
                option: {
                    defined: 'ConfigData',
                },
            },
        },
    };
    const tm = new type_mapper_1.TypeMapper(new Map(), new Map([['ConfigData', '/module/of/config-data.ts']]));
    {
        t.comment('+++ u16 field only');
        tm.clearUsages();
        const mappedFields = tm.mapSerdeFields([u16]);
        (0, spok_1.default)(t, mappedFields, [{ name: 'u16', type: 'beet.u16' }]);
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    }
    {
        t.comment('+++ optionPublicKey field only');
        tm.clearUsages();
        const mappedFields = tm.mapSerdeFields([optionPublicKey]);
        (0, spok_1.default)(t, mappedFields, [
            {
                name: 'optionPublicKey',
                type: 'beet.coption(beetSolana.publicKey)',
            },
        ]);
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_SOLANA_PACKAGE, types_1.BEET_PACKAGE],
        });
        t.ok(tm.usedFixableSerde, 'used fixable serde');
    }
    {
        t.comment('+++ u16, optionPublicKey, configData and vecOptionConfigData fields');
        tm.clearUsages();
        const mappedFields = tm.mapSerdeFields([
            u16,
            optionPublicKey,
            configData,
            vecOptionConfigData,
        ]);
        (0, spok_1.default)(t, mappedFields, [
            { name: 'u16', type: 'beet.u16' },
            {
                name: 'optionPublicKey',
                type: 'beet.coption(beetSolana.publicKey)',
            },
            {
                name: 'configData',
                type: 'configDataBeet',
            },
            {
                name: 'vecOptionConfigData',
                type: 'beet.array(beet.coption(configDataBeet))',
            },
        ]);
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE],
        });
        (0, spok_1.default)(t, Array.from(tm.localImportsByPath), {
            $topic: 'local imports',
            ...[['/module/of/config-data.ts', new Set(['configDataBeet'])]],
        });
        t.ok(tm.usedFixableSerde, 'used fixable serde');
    }
    t.end();
});
// -----------------
// Imports
// -----------------
(0, tape_1.default)('type-mapper: imports for serde packages used ', (t) => {
    const tm = new type_mapper_1.TypeMapper();
    {
        tm.clearUsages();
        t.comment('+++ imports for three packages');
        const packsUsed = [
            types_1.SOLANA_WEB3_PACKAGE,
            types_1.BEET_PACKAGE,
            types_1.BEET_SOLANA_PACKAGE,
        ];
        for (const pack of packsUsed) {
            tm.serdePackagesUsed.add(pack);
        }
        const imports = tm.importsUsed(SOME_FILE_DIR);
        (0, spok_1.default)(t, imports, [
            `import * as web3 from '@solana/web3.js';`,
            `import * as beet from '@metaplex-foundation/beet';`,
            `import * as beetSolana from '@metaplex-foundation/beet-solana';`,
        ]);
    }
    {
        tm.clearUsages();
        t.comment('+++ imports for one package');
        const packsUsed = [types_1.BEET_PACKAGE];
        for (const pack of packsUsed) {
            tm.serdePackagesUsed.add(pack);
        }
        const imports = tm.importsUsed(SOME_FILE_DIR);
        (0, spok_1.default)(t, imports, [`import * as beet from '@metaplex-foundation/beet';`]);
    }
    t.end();
});
// -----------------
// Type Aliases
// -----------------
(0, tape_1.default)('type-mapper: user defined - aliased', (t) => {
    const type = {
        defined: 'UnixTimestamp',
    };
    {
        t.comment('+++ when alias not provided');
        const tm = new type_mapper_1.TypeMapper(new Map(), new Map());
        t.throws(() => tm.map(type), /unknown type UnixTimestamp/i, 'throws unknown type error');
    }
    {
        t.comment('+++ when alias provided');
        const tm = new type_mapper_1.TypeMapper(new Map(), new Map(), new Map([['UnixTimestamp', 'i64']]));
        const ty = tm.map(type);
        t.equal(ty, 'beet.bignum');
        const serde = tm.mapSerde(type);
        t.equal(serde, 'beet.i64');
        (0, spok_1.default)(t, Array.from(tm.serdePackagesUsed), {
            $topic: 'serdePackagesUsed',
            ...[types_1.BEET_PACKAGE],
        });
        t.equal(tm.localImportsByPath.size, 0, 'did not use local imports');
        t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
    }
    t.end();
});
// -----------------
// Tuples
// -----------------
(0, tape_1.default)('type-mapper: tuples top level', (t) => {
    t.test('fixed', (t) => {
        const cases = [
            [
                ['u32', 'u32', 'u32'],
                '[number, number, number]',
                'beet.fixedSizeTuple([beet.u32, beet.u32, beet.u32])',
            ],
            [
                ['i16', 'i16', 'i16'],
                '[number, number, number]',
                'beet.fixedSizeTuple([beet.i16, beet.i16, beet.i16])',
            ],
            [
                ['u16', 'i64', 'u128'],
                '[number, beet.bignum, beet.bignum]',
                'beet.fixedSizeTuple([beet.u16, beet.i64, beet.u128])',
            ],
            [
                [
                    'u16',
                    {
                        name: 'ScalarEnum',
                        kind: 'enum',
                        variants: [
                            {
                                name: 'Wallet',
                            },
                            {
                                name: 'Token',
                            },
                            {
                                name: 'NFT',
                            },
                        ],
                    },
                ],
                '[number, ScalarEnum]',
                'beet.fixedSizeTuple([beet.u16, beet.fixedScalarEnum(ScalarEnum)])',
            ],
        ];
        const tm = new type_mapper_1.TypeMapper();
        {
            // TypeScript types
            for (const [tuple, typesScriptType] of cases) {
                const type = {
                    tuple,
                };
                const ty = tm.map(type);
                t.equal(ty, typesScriptType, `(${tuple}) maps to '${ty}' TypeScript type`);
            }
            t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
            t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        }
        tm.clearUsages();
        {
            // Serdes
            for (const [tuple, _, expectedSerde] of cases) {
                const type = {
                    tuple,
                };
                const serde = tm.mapSerde(type);
                t.equal(serde, expectedSerde, `${serde} maps to ${expectedSerde} serde`);
            }
            t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
            t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        }
        t.end();
    });
    t.test('fixable', (t) => {
        const cases = [
            [
                ['string', { vec: 'u8' }],
                '[string, number[]]',
                'beet.tuple([beet.utf8String, beet.array(beet.u8)])',
            ],
            [
                ['string', 'string', 'u8', { vec: 'i32' }, { option: 'i32' }],
                '[string, string, number, number[], beet.COption<number>]',
                'beet.tuple([beet.utf8String, beet.utf8String, beet.u8, beet.array(beet.i32), beet.coption(beet.i32)])',
            ],
        ];
        const tm = new type_mapper_1.TypeMapper();
        {
            // TypeScript types
            for (const [tuple, typesScriptType] of cases) {
                const type = {
                    tuple,
                };
                const ty = tm.map(type);
                t.equal(ty, typesScriptType, `(${tuple}) maps to '${ty}' TypeScript type`);
            }
            t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
            t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        }
        tm.clearUsages();
        {
            // Serdes
            for (const [tuple, _, expectedSerde] of cases) {
                const type = {
                    tuple,
                };
                const serde = tm.mapSerde(type);
                t.equal(serde, expectedSerde, `${tuple} maps to ${expectedSerde} serde`);
            }
            t.ok(tm.usedFixableSerde, 'used fixable serde');
            t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
        }
        t.end();
    });
});
(0, tape_1.default)('type-mapper: tuples nested', (t) => {
    const cases = [
        [
            { vec: { tuple: ['i64', 'u16'] } },
            '[beet.bignum, number][]',
            'beet.array(beet.fixedSizeTuple([beet.i64, beet.u16]))',
        ],
        [
            { vec: { tuple: ['string', 'u8'] } },
            '[string, number][]',
            'beet.array(beet.tuple([beet.utf8String, beet.u8]))',
        ],
        [
            { option: { tuple: ['u8', 'i8', 'u16', 'i128'] } },
            'beet.COption<[number, number, number, beet.bignum]>',
            'beet.coption(beet.fixedSizeTuple([beet.u8, beet.i8, beet.u16, beet.i128]))',
        ],
    ];
    const tm = new type_mapper_1.TypeMapper();
    {
        // TypeScript types
        for (const [type, typesScriptType] of cases) {
            const ty = tm.map(type);
            t.equal(ty, typesScriptType, `(${(0, helpers_1.deepInspect)(type)}) maps to '${ty}' TypeScript type`);
        }
        t.notOk(tm.usedFixableSerde, 'did not use fixable serde');
        t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    }
    tm.clearUsages();
    {
        // Serdes
        for (const [type, _, expectedSerde] of cases) {
            const serde = tm.mapSerde(type);
            t.equal(serde, expectedSerde, `${(0, helpers_1.deepInspect)(type)} maps to ${expectedSerde} serde`);
        }
        t.ok(tm.usedFixableSerde, 'used fixable serde');
        t.equal(tm.localImportsByPath.size, 0, 'used no local imports');
    }
    t.end();
});
//# sourceMappingURL=type-mapper.js.map