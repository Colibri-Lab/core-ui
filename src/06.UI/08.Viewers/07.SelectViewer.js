Colibri.UI.SelectViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-select-viewer-component');
    }

    set value(value) {
        if(value) {
            if (this._field?.lookup) {
                let selected = false;
                value = value.value ?? value;
                this.AddClass('app-viewer-loading');
                this._setLookup(this._field.lookup).then((response) => {
                    const _result = (response.result ?? response);
                    if(_result?.length) {
                        for (let val of _result) {
                            if (val[this._field.selector.value || 'value'] == value) {
                                super.value = val[this._field.selector.title || 'title'];
                                selected = true;
                                break;
                            }
                        }
                    }
                }).finally(() => {
                    this.RemoveClass('app-viewer-loading')
                    if(!selected) {
                        super.value = value === Object(value) ? value[this._field?.selector?.title ?? 'title'] : value;
                    }
                });
            } else {
                super.value = value === Object(value) ? value[this._field?.selector?.title ?? 'title'] : value;
            }
        }
    }

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
     * Установить новое значение свойству lookup
     * Загрузить значения селектора альтернативным способом, указанным в lookup
     */
    _setLookup() {
        let lookupPromise,
            lookup = this._field.lookup,
            dependsValue = this._getDependsValue();

        if(dependsValue !== undefined && !dependsValue) {
            return new Promise((resolve, reject) => {
                resolve({});
            });
        }

        if (typeof lookup == 'function') {
            lookupPromise = new Promise((resolve, reject) => {
                resolve({
                    result: this._field._lookup()
                });
            });
        }
        else if (typeof lookup == 'object') {
            let lookupType = Object.keys(lookup)[0];

            switch (lookupType) {
                case 'method':
                    if (typeof lookup[lookupType] == 'string') {
                        let lookupMethod = eval(lookup[lookupType]);
                        lookupPromise = lookupMethod(null, dependsValue);
                    }

                    break;
                case 'binding':
                    let binding = lookup[lookupType];
                    if (typeof binding == 'string') {
                        lookupPromise = App.Store.AsyncQuery(binding, dependsValue);
                    }

                    break;
                case 'controller':
                    let controller = lookup[lookupType];

                    let module = eval(controller.module);
                    lookupPromise = module.Call(controller.class, controller.method, {term: null, param: dependsValue});

                    break;
                default:
                    lookupPromise = new Promise((resolve, reject) => { resolve({result: ''}); })
            }
        }

        // каждый метод должен возвращать промис
        return lookupPromise;
    }
}
Colibri.UI.Viewer.Register('Colibri.UI.SelectViewer', '#{app-viewers-select;Выборка}');