export type SerializerSnippets = {
    importSnippet: string;
    resolveFunctionsSnippet: string;
    serialize: string;
    deserialize: string;
};
export declare class CustomSerializers {
    readonly serializers: Map<string, string>;
    private constructor();
    static create(projectRoot: string, serializers: Map<string, string>): CustomSerializers;
    static get empty(): CustomSerializers;
    serializerPathFor(typeName: string, modulePath: string): string | null;
    snippetsFor(typeName: string, modulePath: string, builtinSerializer: string): SerializerSnippets;
}