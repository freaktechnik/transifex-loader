import test from 'ava';
import transifexLoader from '../src';
import {
    getMockEnv, cleanUpMockEnv
} from './_mock-loader-env';
import path from 'path';
import fs from 'mz/fs';

test.afterEach.always((t) => {
    if(t.context.env) {
        return cleanUpMockEnv(t.context.env);
    }
});

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
    t.context.env = mockEnv;

    transifexLoader.call(mockEnv, content);
    const result = await mockEnv._promise;

    t.is(result, content);
    t.truthy(mockEnv._warning);
    t.falsy(mockEnv._error);
});

test("Didn't find resource but loaded config", async (t) => {
    const mockEnv = await getMockEnv("", false);
    t.context.env = mockEnv;

    transifexLoader.call(mockEnv, "test");
    const result = await mockEnv._promise;
    mockEnv._wasSuccessful();

    t.is(result, "test");

    t.falsy(mockEnv._error);
    t.is(mockEnv._warning, `Could not find any transifex resource for ${mockEnv.resourcePath}.`);
});

test("found resource without writing it", async (t) => {
    const mockEnv = await getMockEnv("?-store");
    t.context.env = mockEnv;

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
});

test("found resource and wrote it back to disk", async (t) => {
    const mockEnv = await getMockEnv();
    t.context.env = mockEnv;

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
});

test("Returns cached version when no .transifexrc is found", async (t) => {
    const mockEnv = await getMockEnv("", true);
    t.context.env = mockEnv;
    await fs.unlink(path.join(mockEnv.context, '.transifexrc'));

    transifexLoader.call(mockEnv, "test");
    const result = await mockEnv._promise;
    mockEnv._wasSuccessful();

    t.is(result, "test");

    t.falsy(mockEnv._error);
    t.is(mockEnv._warning.toString(), "Error: Could not find .transifexrc");
});

test("Returns cached version when no .tx/config is found", async (t) => {
    const mockEnv = await getMockEnv("", true);
    t.context.env = mockEnv;
    await fs.unlink(path.join(mockEnv.context, '.tx/config'));

    transifexLoader.call(mockEnv, "test");
    const result = await mockEnv._promise;
    mockEnv._wasSuccessful();

    t.is(result, "test");

    t.falsy(mockEnv._error);
    t.is(mockEnv._warning.toString(), "Error: Could not find .tx/config");
});

test.todo("No-caching query");
test.todo("Fallback to .transifexrc in home dir");
test.todo('Network error when fetching resource content');
