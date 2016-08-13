import test from 'ava';
import { getMappedLang, parseLanguageMap, getResource, NoMatchingResourceError } from '../src/lib/tx-parser';

const checkError = (e) => e == NoMatchingResourceError;

test("parseLanguageMap from string only", (t) => {
    const languageMap = "en : en-US, sr@latin:sr_latin, el:el-GR";
    const expectedLanguageMap = {
        "en-US": "en",
        "sr_latin": "sr@latin",
        "el-GR": "el"
    };

    const parsedMap = parseLanguageMap(languageMap);

    t.deepEqual(parsedMap, expectedLanguageMap);
});

test("parseLanguageMap inherit from object", (t) => {
    const existingMap = {
        "en-US": "en_US",
        "el-GR": "foo",
        "fr-FR": "fr_FR"
    };
    const languageMap = "en : en-US, sr@latin:sr_latin, el:el-GR";
    const expectedLanguageMap = {
        "en-US": "en",
        "sr_latin": "sr@latin",
        "el-GR": "el",
        "fr-FR": "fr_FR"
    };

    const parsedMap = parseLanguageMap(languageMap, existingMap);

    t.deepEqual(parsedMap, expectedLanguageMap);
});

test("Get mapped language without maps", (t) => {
    t.is(getMappedLang("en"), "en");
});

test("Get unmapped language with maps", (t) => {
    t.is(getMappedLang("en", "fr:fr-FR"), "en");
});

test("Get mapped language with map", (t) => {
    t.is(getMappedLang("en-US", "en_US:en-US"), "en_US");
});

test("Get mapped language from global map", (t) => {
    t.is(getMappedLang("en-US", "fr:fr-FR", "en_US:en-US"), "en_US");
});

test("Get mapped language overwritten by resource map", (t) => {
    t.is(getMappedLang("en-US", "en:en-US", "en_US:en-US"), "en");
});

const config = `[main]
host = https://example.com

[project.resource]
source_file=locales/source/main.properties
trans.rm=custom/roh/main.properties
file_filter=locales/<lang>/<lang>.properties
source_lang=en`;

const resolve = () => {
    return Promise.resolve(config);
};

test("getResource from file_filter", async (t) => {
    const resource = await getResource("/full/path/to/locales/de/de.properties", resolve);
    t.is(resource.project, "project");
    t.is(resource.name, "resource");
    t.is(resource.lang, "de");
    t.false(resource.source);
});

test("getResource from trans.<lang>", async (t) => {
    const resource = await getResource("/full/path/to/custom/roh/main.properties", resolve);
    t.is(resource.project, "project");
    t.is(resource.name, "resource");
    t.is(resource.lang, "rm");
    t.false(resource.source);
});

test("getResource from source_file", async (t) => {
    const resource = await getResource("/full/path/to/locales/source/main.properties", resolve, true);
    t.is(resource.project, "project");
    t.is(resource.name, "resource");
    t.is(resource.lang, "en");
    t.true(resource.source);
});

test("getResource source lang without allowing it", async (t) => {
    await t.throws(getResource("/full/path/to/locales/en/en.properties", resolve, false), checkError);
    await t.throws(getResource("/full/path/to/locales/source/main.properties", resolve), checkError);
});

test("getResource that's not registered", (t) => {
    return t.throws(getResource("/full/path/to/nothing.po", resolve), checkError);
});

test("getResource only matches if it's the end of the path", (t) => {
    return t.throws(getResource("/wrong/path/to/locales/en/main.properties/real/translation.json", resolve), checkError);
});

