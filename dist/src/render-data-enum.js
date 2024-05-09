"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDataEnumRecord = exports.renderTypeDataEnumBeet = void 0;
const camelcase_1 = __importDefault(require("camelcase"));
const types_1 = require("./types");
/**
 * Renders union type and related methods for Rust data enum.
 */
function renderTypeDataEnumBeet(args) {
    const { typeMapper, dataEnum, beetVarName, typeName } = args;
    const enumRecordName = `${typeName}Record`;
    const renderedVariants = dataEnum.variants.map((variant) => {
        const tm = typeMapper.clone();
        const beet = renderVariant(tm, enumRecordName, variant);
        typeMapper.syncUp(tm);
        return { beet, usedFixableSerde: tm.usedFixableSerde };
    });
    const renderedBeets = renderedVariants
        .map((variant) => variant.beet)
        .join(',\n');
    // The size of a data enum is considered non-deterministic even though exceptions
    // exist, i.e. when they have a single variant
    const beetType = 'FixableBeet';
    typeMapper.usedFixableSerde = true;
    return `export const ${beetVarName} = ${types_1.BEET_EXPORT_NAME}.dataEnum<${enumRecordName}>([
  ${renderedBeets} 
]) as ${types_1.BEET_EXPORT_NAME}.${beetType}<${typeName}, ${typeName}>
`;
}
exports.renderTypeDataEnumBeet = renderTypeDataEnumBeet;
function renderVariant(typeMapper, enumRecordName, variant) {
    const typeName = `${enumRecordName}["${variant.name}"]`;
    if ((0, types_1.isDataEnumVariantWithNamedFields)(variant)) {
        // Variant with named fields is represented as a struct
        const mappedFields = typeMapper.mapSerdeFields(variant.fields);
        const fieldDecls = mappedFields
            .map((f) => {
            const fieldName = (0, camelcase_1.default)(f.name);
            return `  ['${fieldName}', ${f.type}]`;
        })
            .join(',\n    ');
        const beetArgsStructType = typeMapper.usedFixableSerde
            ? 'FixableBeetArgsStruct'
            : 'BeetArgsStruct';
        const beet = `
  [ 
    '${variant.name}',
    new ${types_1.BEET_EXPORT_NAME}.${beetArgsStructType}<${typeName}>(
    [
    ${fieldDecls}
    ],
    '${typeName}'
  )]`;
        return beet;
    }
    else if ((0, types_1.isDataEnumVariant)(variant)) {
        // Variant with unnamed fields is represented as a tuple
        const tuple = { tuple: variant.fields };
        const fieldDecls = typeMapper.mapSerde(tuple);
        const beetArgsStructType = typeMapper.usedFixableSerde
            ? 'FixableBeetArgsStruct'
            : 'BeetArgsStruct';
        const beet = `[ 
    '${variant.name}', 
    new ${types_1.BEET_EXPORT_NAME}.${beetArgsStructType}<${typeName}>(
    [[ 'fields', ${fieldDecls} ]],
    '${typeName}')
  ]`;
        return beet;
    }
    else {
        // Scalar Variant that's part of a Data Enum
        const beet = `[ '${variant.name}', ${types_1.BEET_EXPORT_NAME}.unit ]`;
        return beet;
    }
}
function renderDataEnumRecord(typeMapper, typeName, variants) {
    const renderedVariants = variants.map((variant) => {
        let fields;
        if ((0, types_1.isDataEnumVariantWithNamedFields)(variant)) {
            fields = variant.fields.map((f) => {
                const typescriptType = typeMapper.map(f.type, f.name);
                const fieldName = (0, camelcase_1.default)(f.name);
                return `${fieldName}: ${typescriptType}`;
            });
            return `  ${variant.name}: { ${fields.join(', ')} }`;
        }
        else if ((0, types_1.isDataEnumVariant)(variant)) {
            fields = variant.fields.map((type, idx) => {
                const ty = (0, types_1.isIdlFieldType)(type) ? type.type : type;
                return typeMapper.map(ty, `${variant.name}[${idx}]`);
            });
            return `  ${variant.name}: { fields: [ ${fields.join(', ')} ] }`;
        }
        else {
            return `  ${variant.name}: void /* scalar variant */`;
        }
    });
    const renderedGuards = variants.map((variant) => {
        const v = variant.name;
        return `export const is${typeName}${v} = (
  x: ${typeName}
): x is ${typeName} & { __kind: '${v}' } => x.__kind === '${v}'`;
    });
    return `
/**
 * This type is used to derive the {@link ${typeName}} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link ${typeName}} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type ${typeName}Record = {
  ${renderedVariants.join(',\n  ')}    
}

/**
 * Union type respresenting the ${typeName} data enum defined in Rust.
 *
 * NOTE: that it includes a \`__kind\` property which allows to narrow types in
 * switch/if statements.
 * Additionally \`is${typeName}*\` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type ${typeName} = beet.DataEnumKeyAsKind<${typeName}Record>

${renderedGuards.join('\n')}    
`.trim();
}
exports.renderDataEnumRecord = renderDataEnumRecord;
//# sourceMappingURL=render-data-enum.js.map