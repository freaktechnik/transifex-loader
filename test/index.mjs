import test from 'ava';
import transifexLoader from '../src/index.mjs';
import {
    getMockEnvironment, cleanUpMockEnvironment
} from './_mock-loader-environment.mjs';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import TransifexConfig from 'transifex-config';
import { stub } from 'sinon';
import { MatchesSourceError } from 'transifex-config/lib/errors.js';

test.afterEach.always(async (t) => {
    if(t.context.env) {
        await cleanUpMockEnvironment(t.context.env);
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
        },
        getOptions() {
            return {};
        }
    };

    const result = transifexLoader.call(mockEnvironment, content);
    t.is(result, content);
    t.false(mockEnvironment._cacheable);
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

test.failing.skip("found resource without writing it", async (t) => { // eslint-disable-line ava/no-skip-test
    const mockEnvironment = await getMockEnvironment("?-store");
    t.context.env = mockEnvironment;

    transifexLoader.call(mockEnvironment, "foo bar");
    const result = await mockEnvironment._promise;
    mockEnvironment._wasSuccessful();

    t.is(result, "bar baz");

    const diskContents = await fs.readFile(mockEnvironment.resourcePath, 'utf8');
    t.is(diskContents, "foo bar");

    t.deepEqual(mockEnvironment._dependencies, [
        path.join(mockEnvironment.context, '.tx/config'),
        path.join(mockEnvironment.context, '.transifexrc')
    ]);
});

test.failing.skip("found resource and wrote it back to disk", async (t) => { // eslint-disable-line ava/no-skip-test
    const mockEnvironment = await getMockEnvironment();
    t.context.env = mockEnvironment;

    transifexLoader.call(mockEnvironment, "foo bar");
    const result = await mockEnvironment._promise;
    mockEnvironment._wasSuccessful();

    t.is(result, "bar baz");

    const diskContents = await fs.readFile(mockEnvironment.resourcePath, 'utf8');
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

test.serial("No-caching query", async (t) => {
    const mockEnvironment = await getMockEnvironment("?disableCache", true),
        txcStub = stub(TransifexConfig.prototype, 'getResource')
            .throws(new MatchesSourceError(mockEnvironment.resourcePath));
    t.teardown(() => txcStub.restore());
    t.context.env = mockEnvironment;

    transifexLoader.call(mockEnvironment, "test");
    const result = await mockEnvironment._promise;
    mockEnvironment._wasSuccessful();

    t.is(result, "test");


    t.falsy(mockEnvironment._error);
});

test.todo("Fallback to .transifexrc in home dir");
test.todo('Network error when fetching resource content');
