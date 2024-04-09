/**
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.Shortcuts = {

    /**
     * Keys added for shortcuts
     * @type {object}
     */
    keys: {},

    /**
     * Add handler to shortcut
     * @public
     * @static
     * @param {Array} keys array of keys to add
     * @param {Function} handler method to execute when shortcut is raised
     */
    Add: function (keys, handler) {
        if(!this.keys[keys]) {
            this.keys[keys] = [];
        }
        this.keys[keys].push(handler);
    },

    /**
     * Bund all shortcuts added before
     * @public
     * @static
     */
    Bind: function() {

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
    
            if(this.keys[key]) {
                let ret = true;
                this.keys[key].forEach((handler) => {
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

