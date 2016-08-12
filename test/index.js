import test from 'ava';
import transifexLoader from '../src/index';
import path from 'path';

const getMockEnv = (failResolve = false) => {
    return {
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
        query: "",
        resourcePath: "",
        context: "",
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
        }
    };
};

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
    const mockEnv = getMockEnv(true);
    transifexLoader.call(mockEnv, content);
    const result = await mockEnv._promise;
    t.is(result, content);
    t.true(mockEnv._cacheable);
});

