
Colibri.UI.Shortcuts = {

    keys: {},

    Add: function (keys, handler) {
        if(!this.keys[keys]) {
            this.keys[keys] = [];
        }
        this.keys[keys].push(handler);
    },

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

