/**
 * @class
 * @extends Colibri.UI.Editor
 * @memberof Colibri.UI
 */
Colibri.UI.LinkEditor = class extends Colibri.UI.Editor {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-link-editor-component');

        this._value = null;
        this._downloadlink = null;

        this._grid = this.parent.grid;

        this._icon = new Colibri.UI.Icon('icon', this);
        this._icon.shown = true;
        this._icon.value = Colibri.UI.FileLinkIcon;

        this._text = new Colibri.UI.TextSpan('span', this);
        this._text.shown = true;

        this.AddHandler('Clicked', (event, args) => {

            this._clickOnLink();

            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });

    }

    _showValue() {
        this._text.value = this.value;
        if(this._grid) {
            const field = this._grid.header.columns.Children(this.parent.name.replaceAll(this.parent.parentRow.name + '-', '')).tag;
            if(field) {
                this._text.value = field.params && field.params.view ? field.params.view : field.desc;
            }
        }
        else if(this.field) {
            this._text.value = this.field.desc + ' #{ui-editors-link-download}';
        }
        else {
            this._text.value = 'Скачать';
        }

    }

    _clickOnLink() {
        if(this.field && this._downloadlink) {
            window.open((window.rpchandler ? window.rpchandler : '') + this._downloadlink + '?name=' + this.field.name + '&data=' + this.field.params.data);
        }
    }

    
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._showValue();
    }

    set downloadlink(value) {
        this._downloadlink = value;
    }


}