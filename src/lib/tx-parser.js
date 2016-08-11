import { getResources } from './read-txconfig';

const SPECIFIC_PATH_KEY = "trans.",
    getResource = async (path, loadFile, matchSourceLang = false) => {
        let lang;
        const resources = await getResources(loadFile),
            resource = resources.find((r) => {
                // If the source language should be fetched, check if it matches the source file
                if(matchSourceLang && "source_file" in r && path.endsWith(r.source_file)) {
                    lang = r.source_lang;
                    return true;
                }
                else {
                    // See if the file matches the file_filter
                    const rmatch = path.match(new RegExp(r.file_filter.replace(/<lang>/g, "([a-zA-Z-]+)")));
                    if(rmatch && rmatch.length) {
                        lang = rmatch[1];
                        return true;
                    }
                    else {
                        // Check if the file matches any of the files given by trans. keys
                        const explicitPaths = Object.keys(r).filter((key) => key.startsWith(SPECIFIC_PATH_KEY));
                        for(const key of explicitPaths) {
                            if(path.endsWith(r[key])) {
                                lang = key.substr(SPECIFIC_PATH_KEY.length);
                                return true;
                            }
                        }
                    }
                }
                return false;
            });
        if(!resource || (!matchSourceLang && resource.source_lang == lang)) {
            throw "No such resource";
        }
        resource.lang = lang;
        resource.source = lang == resource.source_lang;
        return resource;
    },
    parseLanguageMap = (langMapString, langMap = {}) => {
        if(langMapString.length >= 3) {
            langMapString.split(",").forEach((langTuple) => {
                const [ remoteCode, localCode ] = langTuple.split(":");
                langMap[localCode.trim()] = remoteCode.trim();
            });
        }

        return langMap;
    },
    getMappedLang = (lang, resourceMap = "", globalMap = "") => {
        if(!resourceMap && !globalMap) {
            return lang;
        }
        // The resource map overrides the global map
        const map = parseLanguageMap(resourceMap, parseLanguageMap(globalMap));
        if(lang in map) {
            return map[lang];
        }
        return lang;
    };

export { getResource, getMappedLang, parseLanguageMap };
