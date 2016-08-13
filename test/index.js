import test from 'ava';
import transifexLoader from '../src/index';
import { getMockEnv } from './_mock-loader-env';

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

test("fail find file bypasses", async (t) => {
    const content = "foo bar";
    const mockEnv = await getMockEnv(true);
    transifexLoader.call(mockEnv, content);
    const result = await mockEnv._promise;
    t.is(result, content);
    t.true(mockEnv._cacheable);
    t.truthy(mockEnv._error);
});

