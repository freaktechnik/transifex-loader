import path from 'path';
import os from 'os';
import fs from 'fs';
import promisify from 'promisify-call';
import randomString from 'random-string';
import { writeFile } from '../src/lib/utils';
import { deleteFile } from './_cleanup-helper';

const getMockEnv = async (failResolve = false, query = "", generateResource = true, resourceName = "resource") => {
    let context = "";
    if(!failResolve) {
        context = path.join(os.tmpdir(), "transifex-loader-test-" + randomString({
            length: 12
        }));

        await promisify(fs, fs.mkdir, context);
        await promisify(fs, fs.mkdir, path.join(context, ".tx"));

        let txconfig = `[main]
host=https://example.com`;

        if(generateResource) {
            txconfig += `

[main.${resourceName}]
file_filter=<lang>.file
source_lang=source.file`;
        }

        await Promise.all([
            writeFile(path.join(context, '.transifexrc'), `[https://example.com]
username=foo
password=bar
hostname=https://example.com`),
            writeFile(path.join(context, '.tx/config'), txconfig),
            writeFile(path.join(context, 'de.file'), "foo bar")
        ]);
    }
    return {
        _failResolve: failResolve,
        async() {
            let extractedResolve;
            this._promise = new Promise((resolve, reject) => {
                extractedResolve = (error, result) => {
                    if(error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                };
            });
            return extractedResolve;
        },
        cacheable(isCacheable) {
            this._cacheable = isCacheable;
        },
        resourcePath: path.join(context, 'de.file'),
        context,
        query,
        resolve(base, file, callback) {
            if(failResolve) {
                callback("error");
            }
            else {
                callback(null, path.join(base, file));
            }
        },
        _dependencies: [],
        addDependency(dep) {
            this._dependencies.push(dep);
        },
        emitError(error) {
            this._error = error;
        },
        emitWarning(warning) {
            this._warning = warning;
        }
    };
};

const cleanUpMockEnv = async (mockEnv) => {
    if(!mockEnv._failResolve) {
        await Promise.all([
            deleteFile(path.join(mockEnv.context, '.tx/config')),
            deleteFile(path.join(mockEnv.context, '.transifexrc')),
            deleteFile(mockEnv.resourcePath)
        ]);

        await promisify(fs, fs.rmdir, path.join(mockEnv.context, '.tx'));
        await promisify(fs, fs.rmdir, mockEnv.context);
    }
};

export { getMockEnv, cleanUpMockEnv };
