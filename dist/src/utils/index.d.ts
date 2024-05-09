/// <reference types="node" />
/// <reference types="node" />
import { PathLike } from 'fs';
import { IdlTypeArray } from '../types';
import { TypeMapper } from '../type-mapper';
export * from './logs';
/**
 * Ensures that the given directory exists by creating it recursively when necessary.
 * It also removes all existing files from the directory (non-recursively).
 *
 * @throws Error if the path already exists and is not a directory
 * @category utils
 * @private
 */
export declare function prepareTargetDir(dir: PathLike): Promise<void>;
export declare function canAccess(p: PathLike, mode?: number): Promise<boolean>;
/**
 * Ensures that a file or directory is accessible to the current user.
 * @private
 */
export declare function canAccessSync(p: PathLike, mode?: number): boolean;
export declare function withoutTsExtension(p: string): string;
export declare function removeFileIfExists(file: string): Promise<boolean>;
export declare function prependGeneratedWarning(code: string): string;
export declare class UnreachableCaseError extends Error {
    constructor(value: never);
}
/**
 * Number of bytes of the account discriminator.
 */
export declare const ACCOUNT_DISCRIMINATOR_SIZE = 8;
/**
 * Calculates and returns a unique 8 byte discriminator prepended to all
 * accounts.
 *
 * @param name The name of the account to calculate the discriminator.
 */
export declare function accountDiscriminator(name: string): Buffer;
/**
 * Namespace for global instruction function signatures (i.e. functions
 * that aren't namespaced by the state or any of its trait implementations).
 */
export declare const SIGHASH_GLOBAL_NAMESPACE = "global";
/**
 * Calculates and returns a unique 8 byte discriminator prepended to all instruction data.
 *
 * @param name The name of the instruction to calculate the discriminator.
 */
export declare function instructionDiscriminator(name: string): Buffer;
export declare function anchorDiscriminatorField(name: string): {
    name: string;
    type: IdlTypeArray;
};
export declare function anchorDiscriminatorType(typeMapper: TypeMapper, context: string): string;
export declare function getOrCreate<K, V>(map: Map<K, V>, key: K, initial: V): V;
