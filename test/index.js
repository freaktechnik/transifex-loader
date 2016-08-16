import test from 'ava';
import transifexLoader from '../src/index';
import { getMockEnv, cleanUpMockEnv } from './_mock-loader-env';
import path from 'path';
import fs from 'mz/fs';

test("Bypasses if it can't be async", (t) => {
    const content = "foo bar";
    const mockEnv = {
        async() {
            return undefined;
        },
        cacheable(cacheable) {
            this._cacheable = cacheable;
        }
    };

    const result = transifexLoader.call(mockEnv, content);
    t.is(result, content);
    t.true(mockEnv._cacheable);
});

test("Bypasses on error", async (t) => {
    const content = "foo bar";
    const mockEnv = await getMockEnv(undefined, false, undefined, true);

    transifexLoader.call(mockEnv, content);
    const result = await mockEnv._promise;

    t.is(result, content);
    t.truthy(mockEnv._error);
});

test("Didn't find resource but loaded config", async (t) => {
    const mockEnv = await getMockEnv("", false);

    transifexLoader.call(mockEnv, "test");
    const result = await mockEnv._promise;
    mockEnv._wasSuccessful();

    t.is(result, "test");

    t.falsy(mockEnv._error);
    t.is(mockEnv._warning, `Could not find any transifex resource for ${mockEnv.resourcePath}.`);

    await cleanUpMockEnv(mockEnv);
});

test("found resource without writing it", async (t) => {
    const mockEnv = await getMockEnv("?-store");

    transifexLoader.call(mockEnv, "foo bar");
    const result = await mockEnv._promise;
    mockEnv._wasSuccessful();

    t.is(result, "bar baz");

    const diskContents = await fs.readFile(mockEnv.resourcePath, 'utf-8');
    t.is(diskContents, "foo bar");

    t.deepEqual(mockEnv._dependencies, [
        path.join(mockEnv.context, '.tx/config'),
        path.join(mockEnv.context, '.transifexrc')
    ]);

    await cleanUpMockEnv(mockEnv);
});

test("found resource and wrote it back to disk", async (t) => {
    const mockEnv = await getMockEnv();

    transifexLoader.call(mockEnv, "foo bar");
    const result = await mockEnv._promise;
    mockEnv._wasSuccessful();

    t.is(result, "bar baz");

    const diskContents = await fs.readFile(mockEnv.resourcePath, 'utf-8');
    t.is(diskContents, "bar baz");

    t.deepEqual(mockEnv._dependencies, [
        path.join(mockEnv.context, '.tx/config'),
        path.join(mockEnv.context, '.transifexrc')
    ]);

    await cleanUpMockEnv(mockEnv);
});

test.todo("No-caching query");
