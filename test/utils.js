import test from 'ava';
import * as utils from '../src/lib/utils';
import os from 'os';
import path from 'path';

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

test("write file and read it", async (t) => {
    t.plan(4);
    const fileContents = "lorem ipsum";
    const fileName = "file.test";
    const filePath = path.join(os.tmpdir(), fileName);
    await utils.writeFile(filePath, fileContents);

    const loadFile = utils.createLoadFile((base, file, callback) => {
        t.is(file, fileName);
        const joinedPath = path.join(base, file);
        t.is(joinedPath, filePath);
        callback(null, joinedPath);
    }, os.tmpdir(), (file) => {
        t.is(file, filePath);
    });

    const readContents = await loadFile(fileName);
    t.is(readContents, fileContents);
});

test("unwritable file", (t) => {
    return t.throws(utils.writeFile("/../file.test", "no content"));
});

test("unreadable file", (t) => {
    const loadFile = utils.createLoadFile((base, file, callback) => {
        callback(null, path.join(base, file));
    }, "/../");
    return t.throws(loadFile("test.file"));
});
