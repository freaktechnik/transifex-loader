import test from 'ava';
import * as utils from '../src/lib/utils';

test("createLoadFile returns a function", (t) => {
    t.is(typeof utils.createLoadFile(), "function");
});

test("createLoadFile calls first argument as function", async (t) => {
    const passedBase = "./",
        passedFile = "foo";
    const loadFile = utils.createLoadFile((base, file, callback) => {
        t.is(base, passedBase);
        t.is(file, passedFile);
        callback("error");
    }, "./wrong-base");

    await t.throws(loadFile(passedFile, passedBase));
});

test("createLoadFile falls back to base path given at build time", async (t) => {
    const passedBase = "./",
        passedFile = "foo";
    const loadFile = utils.createLoadFile((base, file, callback) => {
        t.is(base, passedBase);
        t.is(file, passedFile);
        callback("error");
    }, passedBase);

    await t.throws(loadFile(passedFile));
});
