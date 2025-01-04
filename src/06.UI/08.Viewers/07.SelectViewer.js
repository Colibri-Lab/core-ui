/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.SelectViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-select-viewer-component');
    }

    /**
     * Value 
     * @type {string|object}
     */
    get value() {
        return this._value;
    }

    /**
     * Value 
     * @type {string|object}
     */
    set value(value) {
        this._value = value;
        if(value !== null && value !== undefined && value !== '') {
            if((this._field?.multiple ?? this._field?.params?.multiple)) {
                // надо обработать вариант с мультизначениями
                if(typeof value == 'string') {
                    value = value.split(',');
                }

                if(Array.isArray(value)) {
                    let r = [];
                    
                    let isObject = false;
                    for(let vv of value) {
                        if(Object.isObject(vv)) {
                            r.push(Lang ? Lang.Translate(vv[this._field?.selector?.title ?? 'title']) : vv[this._field?.selector?.title ?? 'title']);
                            isObject = true;
                        }
                    }

                    if(isObject) {
                        if(r.length > 1) {
                            if((this._field?.params?.showicon ?? false)) {                        
                                let v1 = r.splice(0, 1);
                                let v2 = r.join('<br />');
                                super.value = v1;
                                const icon1 = new Colibri.UI.Icon(this.name + '-hover', this);
                                icon1.shown = true;
                                icon1.value = '<em>+' + r.length + '</em> ' + (this._field.params?.infoIcon ?? Colibri.UI.InfoIcon);
                                icon1.toolTip = v2;
                            } else {
                                super.value = r.join(', ');
                            }
                        }
                        else {
                            super.value = r.pop();
                        }
                    }
                    else if(this._field?.lookup) {
                        this._setLookup(this._field.lookup).then((response) => {
                            const _result = (response.result ?? response);
                            if(_result?.length) {
                                for (let val of _result) {
                                    if (value.indexOf(val[this._field?.selector?.value || 'value']) !== -1) {
                                        r.push(Lang ? Lang.Translate(val[this._field?.selector?.title || 'title']) : val[this._field?.selector?.title || 'title']);
                                    }
                                }
                            }
                        }).finally(() => {
                            this.RemoveClass('app-viewer-loading')

                            if(r.length > 1) {
                                if((this._field?.params?.showicon ?? false)) {     
                                    let v1 = '<dd>' + r[0] + '</dd>';
                                    let v2 = r.join('<br />');
                                    super.value = v1;
                                    const icon1 = new Colibri.UI.Icon(this.name + '-hover', this);
                                    icon1.shown = true;
                                    icon1.value = '<em>' + r.length + '</em> ' + (this._field.params?.infoIcon ?? Colibri.UI.InfoIcon);
                                    icon1.toolTip = v2;
                                } else {
                                    super.value = r.join(', ');
                                }
                            }
                            else {
                                super.value = r.pop();
                            }
    
                        });
                    }
                    else if(this._field.values) {
                        for(let vv of value) {
                            for(const v of this._field.values) {
                                if(vv == (v?.value ?? v?.title ?? v)) {
                                    r.push(Lang ? Lang.Translate(v?.title) : v?.title);
                                }
                            }
                        }
                        if(r.length > 1) {
                            if((this._field?.params?.showicon ?? false)) {     
                                let v1 = '<dd>' + r[0] + '</dd>';
                                let v2 = r.join('<br />');
                                super.value = v1;
                                const icon1 = new Colibri.UI.Icon(this.name + '-hover', this);
                                icon1.shown = true;
                                icon1.value = '<em>' + r.length + '</em> ' + (this._field.params?.infoIcon ?? Colibri.UI.InfoIcon);
                                icon1.toolTip = v2;
                            } else {
                                super.value = r.join(', ');
                            }
                        }
                        else {
                            super.value = r.pop();
                        }
                    } 

                    
                    
                }
            }
            else {
                if(Object.isObject(value)) {
                    try {
                        
                        super.value = Lang.Translate(value[this._field?.selector?.title ?? 'title']) ?? value[this._field?.selector?.title ?? 'title'];
                    } catch(e) {}
                }
                else if (this._field?.lookup) {
                    let selected = false;
                    value = value.value ?? value;
                    this.AddClass('app-viewer-loading');
                    this._setLookup(this._field.lookup).then((response) => {
                        const _result = (response.result ?? response);
                        if(_result?.length) {
                            for (let val of _result) {
                                if (val[this._field?.selector?.value || 'value'] == value) {
                                    super.value = val[this._field?.selector?.title || 'title'][Lang.Current] ?? val[this._field?.selector?.title || 'title'];
                                    selected = true;
                                    break;
                                }
                            }
                        }
                    }).finally(() => {
                        this.RemoveClass('app-viewer-loading')
                        if(!selected) {
                            try {
                                super.value = value[this._field?.selector?.title ?? 'title'][Lang.Current] ?? value[this._field?.selector?.title ?? 'title'];
                            } catch(e) {}
                        }
                    });
                }
                else if(this._field.values) {
                    for(const v of this._field.values) {
                        if((v.value ?? v.title) == (value.value ?? value.title ?? value)) {
                            super.value = v.title[Lang.Current] ?? v.title;
                        }
                    }
                } 
            }

               
            
        }
        else {
            super.value = '';
        }

        if(!super.value) {
            super.value = '&mdash;';
        }

    }

    /** @private */
    _getDependsValue() {
        if (this.root && this._field?.lookup &&
            this._field.lookup['depends']) {

            let dependsField = this._field.lookup['depends'],
                rootValues = this.root.value;
            if (dependsField) {
                if(eval(`typeof rootValues.${dependsField}`) !== 'undefined') {
                    return eval(`rootValues.${dependsField}`);
                }
                return null;
            }
        }
    }

    /**
     * Set lookup
     * @param {object|string} value
     */
     _setLookup(value) {
        let lookupPromise;
        let dependsValue = this._getDependsValue();

        if(dependsValue !== undefined && !dependsValue) {
            return new Promise((resolve, reject) => {
                resolve({});
            });
        }

        if (typeof this._field.lookup == 'function' || typeof this._field.lookup == 'string') {
            if(typeof this._field.lookup == 'string') {
                this._field.lookup = eval(this._field.lookup);
            }
            const lookupMethodRun = this._field.lookup();
            lookupPromise = lookupMethodRun instanceof Promise ? lookupMethodRun : new Promise((resolve, reject) => {
                resolve({
                    result: this._field.lookup()
                });
            });
        }
        else if (typeof this._field.lookup == 'object') {

            if(this._field.lookup?.method) {
                let lookupMethod = this._field.lookup.method;
                if (typeof lookupMethod == 'string') {
                    lookupMethod = eval(this._field.lookup.method);
                }
                lookupPromise = lookupMethod('', dependsValue);
            }
            else if(this._field.lookup?.binding) {
                let binding = this._field.lookup.binding;
                if (typeof binding == 'string') {
                    lookupPromise = App.Store.AsyncQuery(binding, dependsValue);
                }
            }
            else if(this._field.lookup?.controller) {
                let controller = this._field.lookup.controller;
                let module = eval(controller.module);
                lookupPromise = module.Call(controller.class, controller.method, {term: '', param: dependsValue, lookup: this._field.lookup});
            }
            else if(this._field.lookup?.storage) {
                let controller = this._field.lookup?.storage?.controller;
                let module = eval(controller?.module);
                lookupPromise = module.Call(controller.class, controller.method, {term: '', param: dependsValue, lookup: this._field.lookup});
            }
            else {
                lookupPromise = new Promise((resolve, reject) => { resolve({result: ''}); })
            }
        }

        // каждый метод должен возвращать промис
        return lookupPromise;
    }
    
}
Colibri.UI.Viewer.Register('Colibri.UI.SelectViewer', '#{ui-viewers-select}');