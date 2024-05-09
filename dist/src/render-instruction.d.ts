/// <reference types="node" />
import { IdlInstruction, PrimitiveTypeKey } from './types';
import { ForceFixable } from './type-mapper';
import { PathLike } from 'fs';
export declare function renderInstruction(ix: IdlInstruction, fullFileDir: PathLike, programId: string, accountFilesByType: Map<string, string>, customFilesByType: Map<string, string>, typeAliases: Map<string, PrimitiveTypeKey>, forceFixable: ForceFixable, renderAnchorRemainingAccounts: boolean): string;