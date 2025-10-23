Colibri.IO.JsZip = class {

    static loaded = false;

    static Load() {
        return new Promise((resolve, reject) => {
            if(Colibri.IO.JsZip.loaded) {
                resolve(new JSZip());
            } else {
                Colibri.Common.LoadScript('https://unpkg.com/jszip@latest/dist/jszip.min.js').then(() => {
                    Colibri.IO.JsZip.loaded = true;
                    resolve(new JSZip());
                });
            }
        });
    }

}