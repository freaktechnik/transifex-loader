export default class MockAPI {
    getResourceTranslation(langCode, resourceName) {
        if(resourceName == "resource" && langCode.search(/^[a-z-A-Z_@-]+$/) != -1) {
            return Promise.resolve("bar baz");
        }

        return Promise.reject(new Error(`Resource ${resourceName} in language ${langCode} not found`));
    }
}
