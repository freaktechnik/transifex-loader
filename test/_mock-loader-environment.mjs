import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import randomString from 'random-string';

const getMockEnvironment = async (query = "", generateResource = true, resourceName = "resource", noFiles = false) => {
    let context = "";
    if(!noFiles) {
        context = path.join(os.tmpdir(), `transifex-loader-test-${randomString({
            length: 12
        })}`);

        await fs.mkdir(context);
        await fs.mkdir(path.join(context, '.tx'));

        let txconfig = `[main]
host=https://example.com`;

        if(generateResource) {
            txconfig += `

[mainproject.${resourceName}]
file_filter=<lang>.file
source_lang=source.file`;
        }

        await Promise.all([
            fs.writeFile(path.join(context, '.transifexrc'), `[https://example.com]
username=foo
password=bar
hostname=https://example.com`),
            fs.writeFile(path.join(context, '.tx/config'), txconfig),
            fs.writeFile(path.join(context, 'de.file'), "foo bar")
        ]);
    }
    return {
        _wasSuccessful() {
            if(this._error) {
                throw this._error;
            }
        },
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
        _dependencies: [],
        addDependency(dep) {
            this._dependencies.push(dep);
        },
        emitError(error) {
            this._error = error;
        },
        emitWarning(warning) {
            this._warning = warning;
        },
        getOptions() {
            return {
                store: !query || !query.includes('-store'),
                disableCache: !!query && query.includes('disableCache')
            };
        }
    };
};

const cleanUpMockEnvironment = async (mockEnvironment) => {
    if(mockEnvironment.context) {
        const toRemove = [
            fs.unlink(path.join(mockEnvironment.context, '.tx/config')),
            fs.unlink(path.join(mockEnvironment.context, '.transifexrc'))
        ];
        if(mockEnvironment.resourcePath) {
            toRemove.push(fs.unlink(mockEnvironment.resourcePath));
        }
        await Promise.allSettled(toRemove);

        await fs.rmdir(path.join(mockEnvironment.context, '.tx'));
        await fs.rmdir(mockEnvironment.context);
    }
};

export {
    getMockEnvironment, cleanUpMockEnvironment
};
