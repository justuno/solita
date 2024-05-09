import { BEET_EXPORT_NAME, BEET_PACKAGE, BEET_SOLANA_EXPORT_NAME, BEET_SOLANA_PACKAGE, SOLANA_WEB3_EXPORT_NAME, SOLANA_WEB3_PACKAGE, TypeMappedSerdeField } from './types';
export type SerdePackage = typeof BEET_PACKAGE | typeof BEET_SOLANA_PACKAGE | typeof SOLANA_WEB3_PACKAGE;
export type SerdePackageExportName = typeof BEET_EXPORT_NAME | typeof BEET_SOLANA_EXPORT_NAME | typeof SOLANA_WEB3_EXPORT_NAME;
export declare const serdePackages: Map<SerdePackage, SerdePackageExportName>;
export declare function serdePackageExportName(pack: SerdePackage | undefined): SerdePackageExportName | null;
export declare function extractSerdePackageFromImportStatment(importStatement: string): SerdePackage | null;
export declare function serdePackageTypePrefix(pack: SerdePackage | undefined): string;
export declare function isKnownSerdePackage(pack: string): pack is SerdePackage;
export declare function assertKnownSerdePackage(pack: string): asserts pack is SerdePackage;
/**
 * Renders DataStruct for Instruction Args and Account Args
 */
export declare function renderDataStruct({ fields, structVarName, className, argsTypename, discriminatorField, discriminatorName, discriminatorType, paddingField, isFixable, }: {
    discriminatorName?: string;
    discriminatorField?: TypeMappedSerdeField;
    discriminatorType?: string;
    paddingField?: {
        name: string;
        size: number;
    };
    fields: TypeMappedSerdeField[];
    structVarName: string;
    className?: string;
    argsTypename: string;
    isFixable: boolean;
}): string;
/**
 * Renders DataStruct for user defined types
 */
export declare function renderTypeDataStruct({ fields, beetVarName, typeName, isFixable, }: {
    fields: TypeMappedSerdeField[];
    beetVarName: string;
    typeName: string;
    isFixable: boolean;
}): string;
