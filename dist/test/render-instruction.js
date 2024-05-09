"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const render_instruction_1 = require("../src/render-instruction");
const type_mapper_1 = require("../src/type-mapper");
const types_1 = require("../src/types");
const verify_code_1 = require("./utils/verify-code");
const PROGRAM_ID = 'testprogram';
const DIAGNOSTIC_ON = false;
const INSTRUCTION_FILE_DIR = '/root/app/instructions/';
async function checkRenderedIx(t, ix, imports, opts = {}) {
    var _a;
    const { logImports = DIAGNOSTIC_ON, logCode = DIAGNOSTIC_ON, lineNumbers = true, } = opts;
    const { verify = !logCode } = opts;
    const ts = (0, render_instruction_1.renderInstruction)(ix, INSTRUCTION_FILE_DIR, PROGRAM_ID, new Map(), new Map(), new Map(), type_mapper_1.FORCE_FIXABLE_NEVER, (_a = opts.anchorRemainingAccounts) !== null && _a !== void 0 ? _a : false);
    if (logCode) {
        const renderTs = lineNumbers
            ? ts
                .split('\n')
                .map((x, idx) => `${(idx + 1).toString().padStart(3, ' ')}: ${x}`)
                .join('\n')
            : ts;
        console.log(`--------- <TypeScript> --------\n${renderTs}\n--------- </TypeScript> --------`);
    }
    if (verify) {
        (0, verify_code_1.verifySyntacticCorrectness)(t, ts);
        const analyzed = await (0, verify_code_1.analyzeCode)(ts);
        (0, verify_code_1.verifyImports)(t, analyzed, imports, { logImports });
        if (opts.rxs != null) {
            for (const rx of opts.rxs) {
                t.match(ts, rx, `TypeScript matches ${rx.toString()}`);
            }
        }
        if (opts.nonrxs != null) {
            for (const rx of opts.nonrxs) {
                t.doesNotMatch(ts, rx, `TypeScript does not match: ${rx.toString()}`);
            }
        }
    }
}
(0, tape_1.default)('ix: empty args', async (t) => {
    const ix = {
        name: 'empyArgs',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        rxs: [/programId = new web3\.PublicKey/],
    });
});
(0, tape_1.default)('ix: empty args and empty accounts', async (t) => {
    const ix = {
        name: 'empyArgs',
        accounts: [],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        rxs: [/programId = new web3\.PublicKey/],
    });
    t.end();
});
(0, tape_1.default)('ix: one arg', async (t) => {
    const ix = {
        name: 'oneArg',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
        ],
        args: [
            {
                name: 'amount',
                type: 'u64',
            },
        ],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        nonrxs: [/anchorRemainingAccounts\?\: web3\.AccountMeta\[\]/],
    });
});
(0, tape_1.default)('ix: two args', async (t) => {
    const ix = {
        name: 'oneArg',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
        ],
        args: [
            {
                name: 'amount',
                type: 'u64',
            },
            {
                name: 'authority',
                type: 'publicKey',
            },
        ],
    };
    await checkRenderedIx(t, ix, [
        types_1.BEET_PACKAGE,
        types_1.BEET_SOLANA_PACKAGE,
        types_1.SOLANA_WEB3_PACKAGE,
    ]);
});
(0, tape_1.default)('ix: two accounts and two args', async (t) => {
    const ix = {
        name: 'oneArg',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
            {
                name: 'feeWithdrawalDestination',
                isMut: true,
                isSigner: false,
            },
        ],
        args: [
            {
                name: 'amount',
                type: 'u64',
            },
            {
                name: 'authority',
                type: 'publicKey',
            },
        ],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.BEET_SOLANA_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], { logCode: false });
});
(0, tape_1.default)('ix: three accounts, two optional', async (t) => {
    const ix = {
        name: 'choicy',
        legacyOptionalAccountsStrategy: true,
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
            {
                name: 'useAuthorityRecord',
                isMut: true,
                isSigner: false,
                desc: 'Use Authority Record PDA If present the program Assumes a delegated use authority',
                optional: true,
            },
            {
                name: 'burner',
                isMut: false,
                isSigner: false,
                desc: 'Program As Signer (Burner)',
                optional: true,
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [
            // Ensuring that the pubkeys for optional accounts aren't required
            /authority\: web3\.PublicKey/,
            /useAuthorityRecord\?\: web3\.PublicKey/,
            /burner\?\: web3\.PublicKey/,
            // Ensuring that the accounts are only added if the relevant pubkey is
            // provided
            /if \(accounts.useAuthorityRecord != null\)/,
            /if \(accounts.burner != null\)/,
            // Additionally verifying that either the first or both optional pubkeys are
            // provided, but not only the second optional pubkey
            /if \(accounts.useAuthorityRecord == null\).+throw new Error/,
        ],
        nonrxs: [
            /pubkey\: accounts\.useAuthorityRecord \?\? programId,\n.+isWritable\: accounts\.useAuthorityRecord != null,\n.+isSigner\: false,/,
            /pubkey\: accounts\.burner \?\? programId,\n.+isWritable\: false,\n.+isSigner\: false,/,
        ],
    });
});
(0, tape_1.default)('ix: five accounts composed of two required, two optional and one required', async (t) => {
    const ix = {
        name: 'sandwichedOptionalAccounts',
        legacyOptionalAccountsStrategy: true,
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
            {
                name: 'metadata',
                isMut: true,
                isSigner: false,
            },
            {
                name: 'useAuthorityRecord',
                isMut: true,
                isSigner: false,
                desc: 'Use Authority Record PDA If present the program Assumes a delegated use authority',
                optional: true,
            },
            {
                name: 'burner',
                isMut: false,
                isSigner: false,
                desc: 'Program As Signer (Burner)',
                optional: true,
            },
            {
                name: 'masterEdition',
                isMut: false,
                isSigner: false,
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [
            // Ensuring that the pubkeys for optional accounts aren't required
            /authority\: web3\.PublicKey/,
            /metadata\: web3\.PublicKey/,
            /useAuthorityRecord\?\: web3\.PublicKey/,
            /burner\?\: web3\.PublicKey/,
            /masterEdition\: web3\.PublicKey/,
            // Ensuring we are pushing the last 3 accounts.
            /keys\.push\(\{\s+pubkey\: accounts\.useAuthorityRecord,/,
            /keys\.push\(\{\s+pubkey\: accounts\.burner,/,
            /keys\.push\(\{\s+pubkey\: accounts\.masterEdition,/,
        ],
        nonrxs: [
            // Ensuring we are not pushing the first 2 accounts.
            /keys\.push\(\{\s+pubkey\: accounts\.authority,/,
            /keys\.push\(\{\s+pubkey\: accounts\.metadata,/,
        ],
    });
});
(0, tape_1.default)('ix: three accounts, two optional, defaultOptionalAccounts', async (t) => {
    const ix = {
        name: 'choicy',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
            {
                name: 'useAuthorityRecord',
                isMut: true,
                isSigner: false,
                desc: 'Use Authority Record PDA If present the program Assumes a delegated use authority',
                optional: true,
            },
            {
                name: 'burner',
                isMut: false,
                isSigner: false,
                desc: 'Program As Signer (Burner)',
                optional: true,
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [
            // Ensuring that the pubkeys for optional accounts aren't required
            /authority\: web3\.PublicKey/,
            /useAuthorityRecord\?\: web3\.PublicKey/,
            /burner\?\: web3\.PublicKey/,
            // Ensuring that the keys and mut/signer is set correctly
            /pubkey\: accounts\.useAuthorityRecord \?\? programId,\n.+isWritable\: accounts\.useAuthorityRecord != null,\n.+isSigner\: false,/,
            /pubkey\: accounts\.burner \?\? programId,\n.+isWritable\: false,\n.+isSigner\: false,/,
        ],
        nonrxs: [
            /if \(accounts.useAuthorityRecord != null\)/,
            /if \(accounts.burner != null\)/,
            /if \(accounts.useAuthorityRecord == null\).+throw new Error/,
        ],
    });
});
(0, tape_1.default)('ix: accounts render comments with and without desc', async (t) => {
    const ix = {
        name: 'choicy',
        accounts: [
            {
                name: 'withoutDesc',
                isMut: false,
                isSigner: true,
            },
            {
                name: 'withDesc',
                isMut: true,
                isSigner: false,
                desc: 'Use Authority Record PDA If present the program Assumes a delegated use authority',
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [
            /@property .+signer.+ withoutDesc/,
            /@property .+writable.+ withDesc Use Authority Record PDA If present the program Assumes a delegated use authority/,
        ],
    });
});
// -----------------
// Known Accounts
// -----------------
(0, tape_1.default)('ix: empty args one system program account', async (t) => {
    const ix = {
        name: 'empyArgsWithSystemProgram',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
            {
                name: 'systemProgram',
                isMut: false,
                isSigner: false,
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        rxs: [
            /programId = new web3\.PublicKey\('testprogram'\)/,
            /pubkey\: accounts\.systemProgram \?\? web3\.SystemProgram\.programId/,
        ],
        nonrxs: [/pubkey\: accounts\.programId/],
    });
});
(0, tape_1.default)('ix: with args one system program account and programId', async (t) => {
    const ix = {
        name: 'empyArgsWithSystemProgram',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
            {
                name: 'systemProgram',
                isMut: false,
                isSigner: false,
            },
            {
                name: 'programId',
                isMut: false,
                isSigner: false,
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        rxs: [
            /programId = new web3\.PublicKey\('testprogram'\)/,
            /pubkey\: accounts\.programId/,
        ],
    });
});
(0, tape_1.default)('ix: empty args one system program account + one optional rent account', async (t) => {
    const ix = {
        name: 'empyArgsWithSystemProgram',
        legacyOptionalAccountsStrategy: true,
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
            {
                name: 'systemProgram',
                isMut: false,
                isSigner: false,
            },
            {
                name: 'rent',
                isMut: false,
                isSigner: false,
                optional: true,
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        rxs: [
            /programId = new web3\.PublicKey\('testprogram'\)/,
            /pubkey\: accounts.rent,/,
        ],
        nonrxs: [/pubkey\: accounts\.programId/],
    });
});
// -----------------
// Anchor Remaining Accounts
// -----------------
(0, tape_1.default)('ix: one arg rendering remaining accounts', async (t) => {
    const ix = {
        name: 'oneArg',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
        ],
        args: [
            {
                name: 'amount',
                type: 'u64',
            },
        ],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        rxs: [/anchorRemainingAccounts\?\: web3\.AccountMeta\[\]/],
        anchorRemainingAccounts: true,
    });
});
(0, tape_1.default)('ix: empty args rendering remaining accounts', async (t) => {
    const ix = {
        name: 'empyArgs',
        accounts: [
            {
                name: 'authority',
                isMut: false,
                isSigner: true,
            },
        ],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        rxs: [
            /programId = new web3\.PublicKey/,
            /anchorRemainingAccounts\?\: web3\.AccountMeta\[\]/,
        ],
        anchorRemainingAccounts: true,
    });
});
(0, tape_1.default)('ix: empty args and empty accounts', async (t) => {
    const ix = {
        name: 'empyArgs',
        accounts: [],
        args: [],
    };
    await checkRenderedIx(t, ix, [types_1.BEET_PACKAGE, types_1.SOLANA_WEB3_PACKAGE], {
        logCode: false,
        rxs: [/programId = new web3\.PublicKey/],
        nonrxs: [/anchorRemainingAccounts\?\: web3\.AccountMeta\[\]/],
        anchorRemainingAccounts: true,
    });
    t.end();
});
//# sourceMappingURL=render-instruction.js.map