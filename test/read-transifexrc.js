import test from 'ava';
import readTransifexrc from '../src/lib/read-transifexrc';

test("Read and parse transifexrc", async (t) => {
    t.plan(4);
    const rc = `[my site]
username = foo
password = bar
hostname = https://example.com`;
    const expectedRC = {
        "my site": {
            "username": "foo",
            "password": "bar",
            "hostname": "https://example.com"
        }
    };

    const parsedRC = await t.notThrows(readTransifexrc((file) => {
        t.is(file, "./.transifexrc");
        return Promise.resolve(rc);
    }));

    t.deepEqual(parsedRC, expectedRC);

    const cachedRC = await readTransifexrc(() => {
        t.fail();
        return Promise.reject();
    });

    t.deepEqual(cachedRC, expectedRC);
});
