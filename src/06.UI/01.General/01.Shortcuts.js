/**
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.Shortcuts = class {

    /**
     * Keys added for shortcuts
     * @type {object}
     */
    static keys = {};

    /**
     * Add handler to shortcut
     * @public
     * @static
     * @param {Array} keys array of keys to add
     * @param {Function} handler method to execute when shortcut is raised
     */
    static Add(keys, handler) {
        if(!Colibri.UI.Shortcuts.keys[keys]) {
            Colibri.UI.Shortcuts.keys[keys] = [];
        }
        Colibri.UI.Shortcuts.keys[keys].push(handler);
    }

    /**
     * Bund all shortcuts added before
     * @public
     * @static
     */
    static Bind() {

        window.addEventListener('keydown', (e) => {
    
            let key = [];
            if(e.ctrlKey) {
                key.push('Control');
            }
            if(e.altKey) {
                key.push('Alt');
            }
            if(e.shiftKey) {
                key.push('Shift');
            }

            if(e.key) {
                key.push(e.key.toUpperCase());
            }
    
            key = key.join('+');
    
            if(Colibri.UI.Shortcuts.keys[key]) {
                let ret = true;
                Colibri.UI.Shortcuts.keys[key].forEach((handler) => {
                    ret &= handler(key);
                });
                if(!ret) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return ret;
            }
    
        });
    
    }

};

Colibri.UI.Shortcuts.Bind();

