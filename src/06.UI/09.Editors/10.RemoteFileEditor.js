/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Editor
 */
Colibri.UI.RemoteFileEditor = class extends Colibri.UI.Editor {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */ 
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-remotefile-editor-component');
        this._uniqueString = Number.unique();

        this._input = Element.create('input', {type:'file', id: 'component-' + name + '-' + this._uniqueString});
        this._element.append(this._input);
        this._input.attr('accept', 'audio/mp3,audio/wav');
        this._input.attr('multiple', null);

        this._url = new Colibri.UI.TextSpan('url', this);
        this._url.shown = true;
        this._url.copy = true;
        this._url.value = '';

        this._link = new Colibri.UI.Link('link-choose', this);
        this._link.value = '#{ui-editors-remotefile}';
        this._link.shown = true;
        this._link.AddHandler('Clicked', (event, args) => this.__linkClicked(event, args));

        this._input.addEventListener('change', (event) => {
            this._checkChoosedFiles(this._input.files);
            this._input.value = '';
            event.preventDefault();
            event.stopPropagation();
            return false;
        });

    }

    /** @private */
    _checkChoosedFiles(files) {
        const file = files[0];
        this.field.params.upload(file).then((state) => {
            this._url.value = state.url;
            this.Dispatch('Changed', {component: this});
        });
    }

    __linkClicked(event, args) {
        this._input.click();
    }

    /** @private */
    __elementChanged(e) {
        if(this.value) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }

    }

    /** @private */
    _updateFieldData() {
        this.placeholder = this._fieldData?.placeholder;
    }

    /**
     * Validate
     */
    Validate() {
        
    }

    /**
     * Focus on editor
     */
    Focus() {
        this._element.focus();
        // this._element.select();
        this.parent.parent.AddClass('-focused');
    } 

    /**
     * Remove focus from editor
     */
    Blur() {
        this?.parent?.parent?.RemoveClass('-focused');
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this.field.readonly;
    }  
 
    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        this.field.readonly = value === true || value === 'true';
        if(value === true || value === 'true') {
            this._element.attr('readonly', 'readonly');
        }
        else {
            this._element.attr('readonly', null);
        }
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._element.attr('placeholder');
    }

    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        this._element.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return this._url.value;
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        this._url.value = value;
        this.Validate();
        if(value) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }

    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._element.attr('disabled') != 'disabled';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        if(value) {
            this.RemoveClass('ui-disabled');
            this._element.attr('disabled', null);
        }
        else {
            this.AddClass('ui-disabled');
            this._element.attr('disabled', 'disabled');
        }
    }

}
Colibri.UI.Editor.Register('Colibri.UI.RemoteFileEditor', '#{ui-editors-remotefile-text}');