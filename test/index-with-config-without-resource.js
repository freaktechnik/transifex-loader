import test from 'ava';
import index from '../src/';
import { getMockEnv, cleanUpMockEnv } from './_mock-loader-env';

test("Didn't find resource but loaded config", async (t) => {
    const mockEnv = await getMockEnv(false, "", false);

    index.call(mockEnv, "test");
    const result = await mockEnv._promise;
    t.is(result, "test");

    t.falsy(mockEnv._error);
    t.is(mockEnv._warning, `Could not find any transifex resource for ${mockEnv.resourcePath}.`);

    await cleanUpMockEnv(mockEnv);
});

