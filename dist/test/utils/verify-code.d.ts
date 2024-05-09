import { BuildResult } from 'esbuild';
import { Test } from 'tape';
import { SerdePackage } from '../../src/serdes';
type AnalyzedCode = {
    js: string;
    ts: string;
    errors: BuildResult['errors'];
    warnings: BuildResult['warnings'];
};
export declare function deepLog(obj: any): void;
export declare function analyzeCode(ts: string): Promise<{
    js: string;
    ts: string;
    errors: import("esbuild").Message[];
    warnings: import("esbuild").Message[];
}>;
export declare const DEFAULT_VERIFY_IMPORTS_OPTS: {
    expectNoErrors: boolean;
    expectNoWarnings: boolean;
    logImports: boolean;
};
export declare function verifyImports(t: Test, analyzeCode: AnalyzedCode, imports: SerdePackage[], opts?: Partial<{
    expectNoErrors: boolean;
    expectNoWarnings: boolean;
    logImports: boolean;
}>): void;
export declare function verifySyntacticCorrectness(t: Test, ts: string): Promise<void>;
export declare function verifySyntacticCorrectnessForGeneratedDir(t: Test, fullDirPath: string): Promise<void>;
export declare function verifyTopLevelScript(t: Test, file: string, relFile: string): Promise<void>;
export declare function verifyTopLevelScriptForGeneratedDir(t: Test, fullDirPath: string, indexFilesOnly?: boolean): Promise<void>;
export declare function verifyWithTypescriptCompiler(t: Test, fullDirPath: string): Promise<void>;
export {};
