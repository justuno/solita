import { PROGRAM_ID_EXPORT_NAME, PROGRAM_ID_PACKAGE, SOLANA_SPL_TOKEN_EXPORT_NAME, SOLANA_SPL_TOKEN_PACKAGE, SOLANA_WEB3_EXPORT_NAME, SOLANA_WEB3_PACKAGE } from './types';
export type PubkeysPackage = typeof SOLANA_WEB3_PACKAGE | typeof SOLANA_SPL_TOKEN_PACKAGE | typeof PROGRAM_ID_PACKAGE;
export type PubkeysPackageExportName = typeof SOLANA_WEB3_EXPORT_NAME | typeof SOLANA_SPL_TOKEN_EXPORT_NAME | typeof PROGRAM_ID_EXPORT_NAME;
export type ResolvedKnownPubkey = {
    exp: string;
    pack: PubkeysPackage;
    packExportName: PubkeysPackageExportName;
};
export declare function isKnownPubkey(id: string): boolean;
export declare function isProgramIdPubkey(id: string): boolean;
export declare function isProgramIdKnownPubkey(knownPubkey: ResolvedKnownPubkey): boolean;
export declare function resolveKnownPubkey(id: string): ResolvedKnownPubkey | null;
export declare function renderKnownPubkeyAccess(knownPubkey: ResolvedKnownPubkey, programIdPubkey: string): string;