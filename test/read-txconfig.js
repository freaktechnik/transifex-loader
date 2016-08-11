import test from 'ava';
import { readTXConfig, getResources } from '../src/lib/read-txconfig';

// Can only have one config as it gets cached
const config = `[main]
host = https://example.com

[my_project.main_resource]
source_lang=en
source_file=foo.bar
file_filter=<lang>.bar

[my_project.second_res]
file_filter=<lang>.foo
source_lang=de`;

test("read tx config", async (t) => {
    const parsedConfig = {
        "main": {
            "host": "https://example.com"
        },
        "my_project.main_resource": {
            "source_lang": "en",
            "source_file": "foo.bar",
            "file_filter": "<lang>.bar"
        },
        "my_project.second_res": {
            "file_filter": "<lang>.foo",
            "source_lang": "de"
        }
    };

    const readConfig = await readTXConfig((file) => {
        t.is(file, "./.tx/config");
        return Promise.resolve(config);
    });
    t.deepEqual(readConfig, parsedConfig);

    const cachedConfig = await readTXConfig(() => {
        t.fail();
        return Promise.reject();
    });
    t.deepEqual(cachedConfig, parsedConfig);
});

test("get resources only", async (t) => {
    const resources = [
        {
            "project": "my_project",
            "name": "main_resource",
            "source_lang": "en",
            "source_file": "foo.bar",
            "file_filter": "<lang>.bar"
        },
        {
            "project": "my_project",
            "name": "second_res",
            "file_filter": "<lang>.foo",
            "source_lang": "de"
        }
    ];

    const parsedResources = await getResources(() => {
        return Promise.resolve(config);
    });
    t.deepEqual(parsedResources, resources);
});
