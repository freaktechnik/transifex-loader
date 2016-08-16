export default function MockAPI() {
    this._send = function(resource) {
        if(resource.search(/resource\/resource\/translation\/[a-z-A-Z_@-]+$/) != -1) {
            return Promise.resolve(JSON.stringify({
                "content": "bar baz"
            }));
        }
        else {
            return Promise.reject(`Resource ${resource} not found`);
        }
    };
}
