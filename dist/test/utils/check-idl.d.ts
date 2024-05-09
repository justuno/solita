import { Idl, SolitaOpts } from '../../src/solita';
import test from 'tape';
export declare function checkIdl(t: test.Test, idl: Idl, label: string, opts?: SolitaOpts): Promise<{
    outputDir: string;
    generatedSDKDir: string;
}>;
