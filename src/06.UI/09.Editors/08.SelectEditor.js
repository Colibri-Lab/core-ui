Colibri.UI.SelectEditor = class extends Colibri.UI.Editor {
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-select-editor-component');
        
        
        this._element.addEventListener('focus', (e) => this.Focus());
        this._element.addEventListener('blur', (e) => this.Blur());


    }

    Validate() {
        
    }

    Focus() {
        this.parent.parent.AddClass('-focused');
    } 

    Blur() {
        this.parent.parent.RemoveClass('-focused');
    }

    get readonly() {
        return this.field.readonly;
    }  
 
    set readonly(value) {
        this.field.readonly = value === true || value === 'true';
        this._input.readonly = value === true || value === 'true';
    }

    get placeholder() {
        return this._input.placeholder;
    }

    set placeholder(value) {
        this._input.placeholder = value ? value[Lang.Current] ?? value : '';
    }

    get value() {
        return this._input.value?.value;
    }

    set value(value) {
        Colibri.Common.Wait(() => !this.loading).then(() => {
            this._input.value = value;
            this.Validate();
            if(value) {
                this._setFilled();
            } else {
                this._unsetFilled();
            }
        });
        
    }

    get enabled() {
        return this._input.enabled;
    }

    set enabled(value) {
        if(value) {
            this.RemoveClass('ui-disabled');
            this._input.enabled = true;
        }
        else {
            this.AddClass('ui-disabled');
            this._input.enabled = false;
        }
    }

    /**
     * Field object
     * @type {Object}
     */
    get field() {
        return super.field;
    }
    /**
     * Field object
     * @type {Object}
     */
    set field(value) {
        super.field = value;
        this._showField();
    }
    _showField() {
        this._input = this._createSelector();
        this._input.shown = true;
        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this._initializeValues();
        if(this.field?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this.field?.params?.readonly;
        }
        if(this.field?.params?.searchable === undefined) {
            this.searchable = false;    
        }
        else {
            this.searchable = this.field?.params?.searchable;
        }
        if(this.field?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this.field.params.enabled;
        }

        if(this.field?.selector?.ondemand) {
            this._input.__BeforeFilled = () => {
                return new Promise((resolve, reject) => {
                    if (this.field.lookup) {
                        this.loading = true;
                        this.AddClass('app-select-loading');
                        this._setLookup(this.field.lookup).then((response) => {
                            this.values = response.result || response;
                        }).finally(() => {
                            this.loading = false;                        
                            this.RemoveClass('app-select-loading');
                            this._setEnabled();
                            resolve(true);
                        });
                    }
                });
            };
        }
    }

    _createSelector() {

        return new Colibri.UI.Selector(
            'input',
            this,
            this.field.multiple ?? this.field?.params?.multiple ?? false,
            this.field.params?.readonly ?? false,
            this.field.params?.searchable ?? false,
            this.field.values,
            this.field.default,
            this.field.selector?.title ?? 'title',
            this.field.selector?.value ?? 'value',
            this.field.selector?.group ?? null,
            this.field.selector?.__render ?? null,
            (this.field.allowempty === undefined ? true : this.field.allowempty),
            (this.field.clearicon === undefined ? false : this.field.clearicon)
        );
    }

    /**
     * Заново загрузить значения из хранилища
     */
    ReloadValues() {
        this.values = this.field.values;
        if (this.field.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');
            this._setLookup(this.field.lookup).then((response) => {
                this.values = response.result || response;
            }).finally(() => {
                this.loading = false;

                this.value = this.value ? this._input._findValue(this.value) : (this.field.default ?? null);

                this.RemoveClass('app-select-loading');
                this._setEnabled();
                this.Dispatch('Changed');
            });
        }
    }

    _getDependsValue(type = null) {
        if (this.root && this.field?.lookup) {

            if((type && !this.field.lookup[type]['depends']) || (!type && !this.field.lookup['depends'])) {
                return;
            }

            let dependsField = type ? this.field.lookup[type]['depends'] : this.field.lookup['depends'];
            if (dependsField) {
                const rootValues = this.root?.value;
                if(eval(`typeof rootValues?.${dependsField}`) !== 'undefined') {
                    return eval(`rootValues.${dependsField}`);
                }
                return null;
            }
        }
    }

    /**
     * Установить новое значение свойству lookup
     * Загрузить значения селектора альтернативным способом, указанным в lookup
     * @param {(Object|function)} value
     */
    _setLookup(value) {
        let lookupPromise;
        this._lookup = value;

        if (typeof this._lookup == 'function' || typeof this._lookup == 'string') {
            if(typeof this._lookup == 'string') {
                this._lookup = eval(this._lookup);
            }

            let dependsValue = this._getDependsValue();
            let dependsField = this._lookup.depends ?? null;
    
            const lookupMethodRun = this._lookup(dependsValue, dependsField);
            lookupPromise = lookupMethodRun instanceof Promise ? lookupMethodRun : new Promise((resolve, reject) => {
                resolve({
                    result: this._lookup()
                });
            });
        }
        else if (typeof this._lookup == 'object') {

            if(this._lookup?.method) {
                let lookupMethod = this._lookup.method;
                if (typeof lookupMethod == 'string') {
                    lookupMethod = eval(this._lookup.method);
                }

                if(typeof lookupMethod !== 'function') {
                    lookupPromise = new Promise((resolve, reject) => { resolve({result: ''}); })
                }
                else {
                    let dependsValue = this._getDependsValue();
                    let dependsField = this._lookup.depends ?? null;   
                    lookupPromise = lookupMethod(this._input._input.value, dependsValue, dependsField);
                }
            }
            else if(this._lookup?.binding) {
                let binding = this._lookup.binding;
                if (typeof binding == 'string') {
                    let dependsValue = this._getDependsValue('binding');
                    lookupPromise = App.Store.AsyncQuery(binding, dependsValue);
                }
            }
            else if(this._lookup?.controller) {
                let controller = this._lookup.controller;
                let module = eval(controller.module);
                let dependsValue = this._getDependsValue('controller');
                let dependsField = this._lookup.controller.depends ?? null;
                lookupPromise = module.Call(controller.class, controller.method, {term: this._input._input.value, param: dependsValue, depends: dependsField, lookup: this._lookup});
            }
            else if(this._lookup?.storage) {
                let controller = this._lookup?.storage?.controller;
                let module = eval(controller?.module);
                let dependsValue = this._getDependsValue('storage');
                let dependsField = this._lookup?.storage?.depends ?? null;
                lookupPromise = module.Call(controller.class, controller.method, {term: this._input._input.value, param: dependsValue, depends: dependsField, lookup: this._lookup});
            }
            else {
                lookupPromise = new Promise((resolve, reject) => { resolve({result: ''}); })
            }
        }

        // каждый метод должен возвращать промис
        return lookupPromise;
    }

    /**
     * Значения селектора
     * @param {array} value
     * */
    set values(value) {
        let required = this.field?.params?.required;
        if(required === undefined) {
            required = false;
        }
        if(!required) {
            const o = {};
            o[this.field?.selector?.title] = '---';
            o[this.field?.selector?.value] = 0;
            value = isIterable(value) ? [o, ...value] : [o];
        }
        this._input.values = value;
    }

    /**
     * Значения селектора
     * @return {array} value
     * */
    get values() {
        return this._input.values;
    }

    /**
     * Если необходимо инициализировать данные из lookup
     * @private
     */
    _initializeValues() {
        if (this.field.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');

            //delay для того чтобы в форму были загружены значения зависимых полей
            Colibri.Common.Delay(this.root ? 100 : 0).then(() => {
                this._setLookup(this.field.lookup).then((response) => {
                    this.values = response.result || response;
                }).finally(() => {
                    this.loading = false;
                    if(this._lastValue) {
                        this.value = this._lastValue;
                        this._lastValue = null;
                    } else {
                        this._input._renderValue(false);
                    }
                    this.RemoveClass('app-select-loading');
                    this._setEnabled();
                });
            });
        } else {
            this._setEnabled();
        }
    }

    _setEnabled() {
        if(!this.value && this.field.default) {
            this.value = this.field.default;
        }
    }

}