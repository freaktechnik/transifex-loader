import test from 'ava';
import findFile from '../src/lib/find-file.mjs';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';
import randomString from 'random-string';

test("Find file in parent dir", async (t) => {
    const searchedFile = "foo.bar";
    const endDirectory = path.join(os.tmpdir(), `transifex-loader-test-${randomString({
        length: 12
    })}`);
    const startDirectory = path.join(endDirectory, "/some/deep/path");

    await fs.mkdir(endDirectory);
    await fs.writeFile(path.join(endDirectory, searchedFile), "foo bar");

    const foundPath = await findFile(startDirectory, searchedFile);
    t.is(foundPath, endDirectory);

    await fs.unlink(path.join(endDirectory, searchedFile));
    await fs.rmdir(endDirectory);
});

test("Gives up once it reaches the root dir without result", async (t) => {
    const searchedFile = "foo.bar";
    const startDirectory = os.tmpdir();

    await t.throwsAsync(findFile(startDirectory, searchedFile));
});
