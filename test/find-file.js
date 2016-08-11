import test from 'ava';
import findFile from '../src/lib/find-file';
import path from 'path';

test("Find file in parent dir", async (t) => {
    t.plan(6);
    const searchedFile = "foo.bar";
    const startDir = "/some/deep/path/to/a/file";
    const endDir = "/some/deep/path/to";

    let callNumber = 0;

    const finder = findFile((file, dir) => {
        t.is(file, searchedFile);
        if(callNumber == 0) {
            t.is(dir, startDir);
        }

        ++callNumber;

        if(dir != endDir) {
            return Promise.reject();
        }
        else {
            return Promise.resolve(dir);
        }
    }, "/not/the/start");

    const path = await t.notThrows(finder(searchedFile, startDir));
    t.is(path, endDir);
});

test("Gives up once it reaches the root dir without result", async (t) => {
    t.plan(5);
    const searchedFile = "foo.bar";
    const startDir = "/some/path";

    let callNumber = 0;

    const finder = findFile((file, dir) => {
        t.is(file, searchedFile);

        if(callNumber == 0) {
            t.is(dir, startDir);
        }

        ++callNumber;

        return Promise.reject();
    });

    await t.throws(finder(searchedFile, startDir));
});

test("Falls back to base dir in constructor", async (t) => {
    t.plan(4);
    const searchedFile = "foo.bar";
    const fallbackDir = "/some/fallback";

    const finder = findFile((file, dir) => {
        t.is(file, searchedFile);
        t.is(dir, fallbackDir);
        return Promise.resolve(`${fallbackDir}/${file}`);
    }, fallbackDir);

    const path = await t.notThrows(finder(searchedFile));
    t.is(path, `${fallbackDir}/${searchedFile}`);
});

test("Default fallback start", async (t) => {
    t.plan(4);

    const searchedFile = "foo.bar";
    const defaultDir = path.resolve("./");

    const finder = findFile((file, dir) => {
        t.is(file, searchedFile);
        t.is(dir, defaultDir);
        return Promise.resolve("done");
    });

    const returns = await t.notThrows(finder(searchedFile));
    t.is(returns, "done");
});

