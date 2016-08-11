import test from 'ava';
import parseRC from '../src/lib/parse-rc';

test("parse rc", (t) => {
    const rc = `[test]
test_rc = test value
foo=bar
   indent = test

[second section]
someKey = ç*%T&3
eq==
neq=!= test`;
    const parsedRC = {
        "test": {
            "test_rc": "test value",
            "foo": "bar",
            "indent": "test"
        },
        "second section": {
            "someKey": "ç*%T&3",
            "eq": "=",
            "neq": "!= test"
        }
    };

    t.deepEqual(parseRC(rc), parsedRC);
});

test("parse empty rc", (t) => {
    t.deepEqual(parseRC(""), {});
});
