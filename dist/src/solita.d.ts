/// <reference types="node" />
import { PathLike } from 'fs';
import { TypeAliases, Idl, Serializers } from './types';
import { Options } from 'prettier';
export * from './types';
export type SolitaOpts = {
    formatCode?: boolean;
    formatOpts?: Options;
    prependGeneratedWarning?: boolean;
    typeAliases?: TypeAliases;
    serializers?: Serializers;
    projectRoot?: string;
    anchorRemainingAccounts?: boolean;
};
export declare class Solita {
    private readonly idl;
    private readonly formatCode;
    private readonly formatOpts;
    private readonly accountsHaveImplicitDiscriminator;
    private readonly prependGeneratedWarning;
    private readonly typeAliases;
    private readonly serializers;
    private readonly projectRoot;
    private readonly hasInstructions;
    private readonly anchorRemainingAccounts;
    private paths;
    constructor(idl: Idl, { formatCode, formatOpts, prependGeneratedWarning, typeAliases, serializers, projectRoot, anchorRemainingAccounts, }?: SolitaOpts);
    private accountFilesByType;
    private customFilesByType;
    private resolveFieldType;
    renderCode(): {
        instructions: Record<string, string>;
        accounts: Record<string, string>;
        types: Record<string, string>;
        errors: string | null;
    };
    renderAndWriteTo(outputDir: PathLike): Promise<void>;
    private writeInstructions;
    private writeAccounts;
    private writeTypes;
    private writeErrors;
    private writeMainIndex;
    private renderImportIndex;
}