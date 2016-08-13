import test from 'ava';
import index from '../src/';
import { getMockEnv, cleanUpMockEnv } from './_mock-loader-env';
import promisify from 'promisify-call';
import path from 'path';
import fs from 'fs';

test("Transifex doesn't recognize resource", async (t) => {
    const mockEnv = await getMockEnv(false, undefined, undefined, "not-found");

    index.call(mockEnv, "foo bar");
    await t.throws(mockEnv._promise);

    const diskContents = await promisify(fs, fs.readFile, mockEnv.resourcePath, 'utf-8');
    t.is(diskContents, "foo bar");

    t.deepEqual(mockEnv._dependencies, [
        path.join(mockEnv.context, '.tx/config'),
        path.join(mockEnv.context, '.transifexrc')
    ]);

    await cleanUpMockEnv(mockEnv);
});
