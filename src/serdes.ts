import { strict as assert } from 'assert'
import {
  BEET_EXPORT_NAME,
  BEET_PACKAGE,
  BEET_SOLANA_EXPORT_NAME,
  BEET_SOLANA_PACKAGE,
  LOCAL_TYPES_EXPORT_NAME,
  LOCAL_TYPES_PACKAGE,
  SOLANA_WEB3_EXPORT_NAME,
  SOLANA_WEB3_PACKAGE,
  TypeMappedSerdeField,
} from './types'

export type SerdePackage =
  | typeof BEET_PACKAGE
  | typeof BEET_SOLANA_PACKAGE
  | typeof SOLANA_WEB3_PACKAGE
  | typeof LOCAL_TYPES_PACKAGE
export type SerdePackageExportName =
  | typeof BEET_EXPORT_NAME
  | typeof BEET_SOLANA_EXPORT_NAME
  | typeof SOLANA_WEB3_EXPORT_NAME
  | typeof LOCAL_TYPES_EXPORT_NAME

export const serdePackages: Map<SerdePackage, SerdePackageExportName> = new Map(
  [
    [BEET_PACKAGE, BEET_EXPORT_NAME],
    [BEET_SOLANA_PACKAGE, BEET_SOLANA_EXPORT_NAME],
    [SOLANA_WEB3_PACKAGE, SOLANA_WEB3_EXPORT_NAME],
    [LOCAL_TYPES_PACKAGE, LOCAL_TYPES_EXPORT_NAME],
  ]
)

const packsByLengthDesc = Array.from(serdePackages.keys()).sort((a, b) =>
  a.length > b.length ? -1 : 1
)

export function serdePackageExportName(
  pack: SerdePackage | undefined
): SerdePackageExportName | null {
  if (pack == null) return null

  const exportName = serdePackages.get(pack)
  assert(exportName != null, `Unkonwn serde package ${pack}`)
  return exportName
}

export function extractSerdePackageFromImportStatment(importStatement: string) {
  // Avoiding matching on 'beet' for 'beet-solana' by checking longer keys first
  for (const pack of packsByLengthDesc) {
    const exportName = serdePackages.get(pack)!

    if (importStatement.includes(pack)) {
      assert(
        importStatement.includes(`as ${exportName}`),
        `${importStatement} should import ${pack} as ${exportName}`
      )
      return pack
    }
  }
  return null
}

export function serdePackageTypePrefix(pack: SerdePackage | undefined): string {
  const packExportName = serdePackageExportName(pack)
  return packExportName == null ? '' : `${packExportName}.`
}

export function isKnownSerdePackage(pack: string): pack is SerdePackage {
  return (
    pack === BEET_PACKAGE ||
    pack === BEET_SOLANA_PACKAGE ||
    pack === SOLANA_WEB3_PACKAGE
  )
}

export function assertKnownSerdePackage(
  pack: string
): asserts pack is SerdePackage {
  assert(
    isKnownSerdePackage(pack),
    `${pack} is an unknown and thus not yet supported de/serializer package`
  )
}

// -----------------
// Rendering processed serdes to struct
// -----------------

/**
 * Renders DataStruct for Instruction Args and Account Args
 */
export function renderDataStruct({
  fields,
  structVarName,
  className,
  argsTypename,
  discriminatorName,
}: {
  fields: TypeMappedSerdeField[]
  structVarName: string
  className?: string
  argsTypename: string
  discriminatorName?: string
}) {
  const fieldDecls =
    fields.length === 0
      ? ''
      : fields
          .map((f) => {
            return `['${f.name}', ${f.type}]`
          })
          .join(',\n    ')

  let structType =
    fields.length === 0
      ? `{ ${discriminatorName}: number[]; }`
      : `${argsTypename} & {
    ${discriminatorName}: number[];
  }
`

  // -----------------
  // Beet Struct (Account)
  // -----------------
  if (className != null) {
    return `const ${structVarName} = new ${BEET_EXPORT_NAME}.BeetStruct<
    ${className},
    ${structType}
>(
  [
    ['${discriminatorName}', ${BEET_EXPORT_NAME}.fixedSizeArray(${BEET_EXPORT_NAME}.u8, 8)],
    ${fieldDecls}
  ],
  ${className}.fromArgs,
  '${className}'
)`
  } else {
    // -----------------
    // Beet Args Struct (Instruction)
    // -----------------
    return `const ${structVarName} = new ${BEET_EXPORT_NAME}.BeetArgsStruct<${structType}>(
  [
    ['${discriminatorName}', ${BEET_EXPORT_NAME}.fixedSizeArray(${BEET_EXPORT_NAME}.u8, 8)],
    ${fieldDecls}
  ],
  '${argsTypename}'
)`
  }
}

/**
 * Renders DataStruct for user defined types
 */
export function renderTypeDataStruct({
  fields,
  structVarName,
  typeName,
}: {
  fields: TypeMappedSerdeField[]
  structVarName: string
  typeName: string
}) {
  assert(
    fields.length > 0,
    `Rendering struct for ${typeName} should have at least 1 field`
  )
  const fieldDecls = fields
    .map((f) => {
      return `['${f.name}', ${f.type}]`
    })
    .join(',\n    ')

  // -----------------
  // Beet Args Struct (Instruction)
  // -----------------
  return `const ${structVarName} = new ${BEET_EXPORT_NAME}.BeetArgsStruct<${typeName}>(
  [
    ${fieldDecls}
  ],
  '${typeName}'
)`
}
