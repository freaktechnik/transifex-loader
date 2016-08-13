import test from 'ava';
import { getResource } from '../src/lib/tx-parser';

const noTxConfig = ".tx/config not found";
const resolve = () => Promise.reject(noTxConfig);

test("No TX config throws the error from fs", (t) => {
    return t.throws(getResource("/some/resource.bar", resolve), (e) => {
        return e === noTxConfig;
    });
});
