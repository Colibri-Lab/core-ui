Colibri.UI.Forms.Select = class extends Colibri.UI.Forms.Field {

    /**
     * Отрисовка содержания компонента поля 
     */
    RenderFieldContainer() {

        this.AddClass('app-component-select-field');


        const contentContainer = this.contentContainer;

        this._input = this._createSelector();

        this._initializeValues();

        this._input.shown = true;
        this.placeholder = this._fieldData.placeholder;
        if(this._fieldData?.params?.placeholderinfo) {
            this.placeholderinfo = this._fieldData.params.placeholderinfo;
        }

        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('Clicked', (event, args) => this.Dispatch('Clicked', args));

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.searchable === undefined) {
            this.searchable = false;    
        }
        else {
            this.searchable = this._fieldData?.params?.searchable;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        if(this._fieldData?.params?.showToolTip) {
            this._input.showToolTip = this._fieldData?.params?.showToolTip;
        }

        if(this._fieldData?.selector?.ondemand) {
            this._input.__BeforeFilled = () => {
                return new Promise((resolve, reject) => {
                    if (this._fieldData.lookup) {
                        this.loading = true;
                        this.AddClass('app-select-loading');
                        this._setLookup(this._fieldData.lookup).then((response) => {
                            this.values = response.result || response;
                        }).finally(() => {
                            this.loading = false;                        
                            this.RemoveClass('app-select-loading');
                            this._setEnabled();
                            resolve(this._fieldData?.selector?.ondemand);
                        });
                    }
                });
            };
        }

    }

    /**
     * Заново загрузить значения из хранилища
     */
    ReloadValues() {
        this.values = this._fieldData.values;
        if (this._fieldData.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');
            this._setLookup(this._fieldData.lookup).then((response) => {
                this.values = response.result || response;
            }).finally(() => {
                this.loading = false;

                this.value = this.value ? this._input._findValue(this.value) : (this._fieldData.default ?? null);

                this.RemoveClass('app-select-loading');
                this._setEnabled();
                this.Dispatch('Changed');
            });
        }
    }

    _getDependsValue(type = null) {
        if (this.root && this._fieldData?.lookup) {

            if((type && !this._fieldData.lookup[type]['depends']) || (!type && !this._fieldData.lookup['depends'])) {
                return;
            }

            let dependsField = type ? this._fieldData.lookup[type]['depends'] : this._fieldData.lookup['depends'];
            if (dependsField) {
                dependsField = dependsField.replaceAll('{', '').replaceAll('}', '');
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
    
            const lookupMethodRun = this._lookup(this._input._input.value, dependsValue, dependsField, this);
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
                    lookupPromise = lookupMethod(this._input._input.value, dependsValue, dependsField, this);
                }
            }
            else if(this._lookup?.binding) {
                let binding = this._lookup.binding;
                let dependsField = '';
                if(typeof binding == 'object') {
                    dependsField = binding.depends;
                    binding = binding.query;
                }
                if (typeof binding == 'string') {
                    let dependsValue = this._getDependsValue('binding');
                    lookupPromise = new Promise((resolve, reject) => {
                        App.Store.AsyncQuery(binding).then((results) => {
                            let ret = [];
                            for(const result of results) {
                                if(result[dependsField] == dependsValue) {
                                    ret.push(result);
                                }
                            }
                            resolve(ret);
                        });
                    });
                }
            }
            else if(this._lookup?.controller) {
                let controller = this._lookup.controller;
                let module = eval(controller.module);
                let dependsValue = this._getDependsValue('controller');
                let dependsField = this._lookup.controller.depends ?? null;
                let cacheResults = this._lookup.controller?.cache ?? false;
                lookupPromise = module.Call(controller.class, controller.method, {term: this._input._input.value, param: dependsValue, depends: dependsField, lookup: this._lookup, _requestCache: cacheResults});
            }
            else if(this._lookup?.storage) {
                let controller = this._lookup?.storage?.controller;
                let module = eval(controller?.module);
                let dependsValue = this._getDependsValue('storage');
                let dependsField = this._lookup?.storage?.depends ?? null;
                let cacheResults = this._lookup?.storage?.cache ?? false;
                lookupPromise = module.Call(controller.class, controller.method, {term: this._input._input.value, param: dependsValue, depends: dependsField, lookup: this._lookup, _requestCache: cacheResults});
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
        value = this._convertProperty('Array', value);
        let required = this._fieldData?.params?.required;
        if(required === undefined) {
            required = false;
        }
        if(!required) {
            const o = {};
            o[this._fieldData?.selector?.title ?? 'title'] = '---';
            o[this._fieldData?.selector?.value ?? 'value'] = 0;
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
     * Поставить фокус
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Только для чтения
     */
    get readonly() {
        return this._input.readonly;
    }
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._input.readonly = value;
        if(this._input.readonly) {
            this.AddClass('app-component-readonly');
        } else {
            this.RemoveClass('app-component-readonly');
        }
    }

    /**
     * Can search in select items
     * @type {bool}
     */
    get searchable() {
        return this._input.searchable;
    }
    /**
     * Can search in select items
     * @type {bool}
     */
    set searchable(value) {
        value = this._convertProperty('Boolean', value);
        this._input.searchable = value;
    }

    /**
     * Замещающий текст
     */
    get placeholder() {
        return this._input.placeholder;
    }
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.placeholder = value;
    }

    get placeholderinfo() {
        return this._input.placeholderinfo;
    }
    set placeholderinfo(value) {
        this._input.placeholderinfo = value;
    }

    get placeholderempty() {
        return this._input.placeholderempty;
    }
    set placeholderempty(value) {
        this._input.placeholderempty = value;
    }

    /**
     * Выбранное значение
     */
    get value() {
        let value = this._lastValue || this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(Array.isArray(value)) {
            value = value.map((v) => v ? v[this._fieldData.selector?.value ?? 'value'] ?? v : null);
        }
        else if(Object.isObject(value)) {
            value = value[this._fieldData.selector?.value ?? 'value'] ?? value;
        }
        return value;
    }
    set value(value) {
        if(this.loading === true) {
            this._lastValue = value;
        } else {
            this._input.value = value;
        }
    }

    /**
     * Включен/выключен
     */
    get enabled() {
        return this._input.enabled;
    }
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this.RemoveClass('app-component-disabled');
        }
        else {
            this.AddClass('app-component-disabled');
        }
        this._input.enabled = value;
    }

    _setEnabled() {
        if(!this.value && this._fieldData.default) {
            this.value = this._fieldData.default;
        }
    }

    /**
     * Если необходимо инициализировать данные из lookup
     * @private
     */
    _initializeValues() {
        if (this._fieldData.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');

            //delay для того чтобы в форму были загружены значения зависимых полей
            Colibri.Common.Delay(this.root ? 100 : 0).then(() => {
                this._setLookup(this._fieldData.lookup).then((response) => {
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

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value;
        }
    }

    set popupconfig(value) {
        this._input.popupconfig = value;
    }

    _createSelector() {

        return new Colibri.UI.Selector(
            'input',
            this.contentContainer,
            this._fieldData.multiple ?? this._fieldData?.params?.multiple ?? false,
            this._fieldData.params?.readonly ?? false,
            this._fieldData.params?.searchable ?? false,
            this._fieldData.values,
            this._fieldData.default,
            this._fieldData.selector?.title ?? 'title',
            this._fieldData.selector?.value ?? 'value',
            this._fieldData.selector?.group ?? null,
            this._fieldData.selector?.__render ?? null,
            ((this._fieldData.allowempty ?? this._fieldData?.params?.allowempty) === undefined ? true : (this._fieldData.allowempty ?? this._fieldData?.params?.allowempty)),
            ((this._fieldData.clearicon ?? this._fieldData?.params?.clearicon) === undefined ? false : (this._fieldData.clearicon ?? this._fieldData?.params?.clearicon))
        );
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Select', 'Colibri.UI.Forms.Select', '#{ui-fields-select}')
