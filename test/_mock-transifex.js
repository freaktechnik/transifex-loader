export default function MockAPI() {
    this._send = function(resource) {
        if(resource.includes("resource/resource")) {
            return Promise.resolve(JSON.stringify({
                "content": "bar baz"
            }));
        }
        else {
            return Promise.reject("Resource not found");
        }
    };
}
