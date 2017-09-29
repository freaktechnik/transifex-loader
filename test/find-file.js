import test from 'ava';
import findFile from '../src/lib/find-file';
import path from 'path';
import fs from 'mz/fs';
import os from 'os';
import randomString from 'random-string';

test("Find file in parent dir", async (t) => {
    const searchedFile = "foo.bar";
    const endDir = path.join(os.tmpdir(), `transifex-loader-test-${randomString({
        length: 12
    })}`);
    const startDir = path.join(endDir, "/some/deep/path");

    await fs.mkdir(endDir);
    await fs.writeFile(path.join(endDir, searchedFile), "foo bar");

    const foundPath = await findFile(startDir, searchedFile);
    t.is(foundPath, endDir);

    await fs.unlink(path.join(endDir, searchedFile));
    await fs.rmdir(endDir);
});

test("Gives up once it reaches the root dir without result", async (t) => {
    const searchedFile = "foo.bar";
    const startDir = os.tmpdir();

    await t.throws(findFile(startDir, searchedFile));
});
