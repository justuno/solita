import { Idl } from '../solita';
import { Options as PrettierOptions } from 'prettier';
import { Serializers, TypeAliases } from '../types';
export declare function generateTypeScriptSDK(idl: Idl, sdkDir: string, prettierConfig?: PrettierOptions, typeAliases?: TypeAliases, serializers?: Serializers, anchorRemainingAccounts?: boolean): Promise<void>;
