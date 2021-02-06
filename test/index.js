import test from 'ava';
import transifexLoader from '../src';
import {
    getMockEnv as getMockEnvironment, cleanUpMockEnv as cleanUpMockEnvironment
} from './_mock-loader-env';
import path from 'path';
import fs from 'mz/fs';

test.afterEach.always((t) => {
    if(t.context.env) {
        return cleanUpMockEnvironment(t.context.env);
    }
});

test("Bypasses if it can't be async", (t) => {
    const content = "foo bar";
    const mockEnvironment = {
        async() {
            // do nothing
        },
        cacheable(cacheable) {
            this._cacheable = cacheable;
        }
    };

    const result = transifexLoader.call(mockEnvironment, content);
    t.is(result, content);
    t.true(mockEnvironment._cacheable);
});

test("Bypasses on error", async (t) => {
    const content = "foo bar";
    const mockEnvironment = await getMockEnvironment(undefined, false, undefined, true);
    t.context.env = mockEnvironment;

    transifexLoader.call(mockEnvironment, content);
    const result = await mockEnvironment._promise;

    t.is(result, content);
    t.truthy(mockEnvironment._warning);
    t.falsy(mockEnvironment._error);
});

test("Didn't find resource but loaded config", async (t) => {
    const mockEnvironment = await getMockEnvironment("", false);
    t.context.env = mockEnvironment;

    transifexLoader.call(mockEnvironment, "test");
    const result = await mockEnvironment._promise;
    mockEnvironment._wasSuccessful();

    t.is(result, "test");

    t.falsy(mockEnvironment._error);
    t.is(mockEnvironment._warning, `Could not find any transifex resource for ${mockEnvironment.resourcePath}.`);
});

test("found resource without writing it", async (t) => {
    const mockEnvironment = await getMockEnvironment("?-store");
    t.context.env = mockEnvironment;

    transifexLoader.call(mockEnvironment, "foo bar");
    const result = await mockEnvironment._promise;
    mockEnvironment._wasSuccessful();

    t.is(result, "bar baz");

    const diskContents = await fs.readFile(mockEnvironment.resourcePath, 'utf-8');
    t.is(diskContents, "foo bar");

    t.deepEqual(mockEnvironment._dependencies, [
        path.join(mockEnvironment.context, '.tx/config'),
        path.join(mockEnvironment.context, '.transifexrc')
    ]);
});

test("found resource and wrote it back to disk", async (t) => {
    const mockEnvironment = await getMockEnvironment();
    t.context.env = mockEnvironment;

    transifexLoader.call(mockEnvironment, "foo bar");
    const result = await mockEnvironment._promise;
    mockEnvironment._wasSuccessful();

    t.is(result, "bar baz");

    const diskContents = await fs.readFile(mockEnvironment.resourcePath, 'utf-8');
    t.is(diskContents, "bar baz");

    t.deepEqual(mockEnvironment._dependencies, [
        path.join(mockEnvironment.context, '.tx/config'),
        path.join(mockEnvironment.context, '.transifexrc')
    ]);
});

test("Returns cached version when no .transifexrc is found", async (t) => {
    const mockEnvironment = await getMockEnvironment("", true);
    t.context.env = mockEnvironment;
    await fs.unlink(path.join(mockEnvironment.context, '.transifexrc'));

    transifexLoader.call(mockEnvironment, "test");
    const result = await mockEnvironment._promise;
    mockEnvironment._wasSuccessful();

    t.is(result, "test");

    t.falsy(mockEnvironment._error);
    t.is(mockEnvironment._warning.toString(), "Error: Could not find .transifexrc");
});

test("Returns cached version when no .tx/config is found", async (t) => {
    const mockEnvironment = await getMockEnvironment("", true);
    t.context.env = mockEnvironment;
    await fs.unlink(path.join(mockEnvironment.context, '.tx/config'));

    transifexLoader.call(mockEnvironment, "test");
    const result = await mockEnvironment._promise;
    mockEnvironment._wasSuccessful();

    t.is(result, "test");

    t.falsy(mockEnvironment._error);
    t.is(mockEnvironment._warning.toString(), "Error: Could not find .tx/config");
});

test.todo("No-caching query");
test.todo("Fallback to .transifexrc in home dir");
test.todo('Network error when fetching resource content');
