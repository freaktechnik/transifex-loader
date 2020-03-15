export default class MockAPI {
    getResourceTranslation(langCode, resourceName) {
        if(resourceName == "resource" && langCode.search(/^[@A-Z_a-z-]+$/) != -1) {
            return Promise.resolve("bar baz");
        }

        return Promise.reject(new Error(`Resource ${resourceName} in language ${langCode} not found`));
    }
}
