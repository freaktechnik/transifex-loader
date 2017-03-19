export default class MockAPI {
    getResourceTranslation(langCode, resourceName) {
        if(resourceName == "resource" && langCode.search(/^[a-z-A-Z_@-]+$/) != -1) {
            return Promise.resolve("bar baz");
        }
        else {
            return Promise.reject(`Resource ${resourceName} in language ${langCode} not found`);
        }
    }
}
