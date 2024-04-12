/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.GridFileViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-gridfile-viewer-component');

        this._value = null;

        this.AddHandler('ContextMenuIconClicked', (event, args) => this.__createContextMenu(event, args));
        this.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnContextMenu(event, args));        

    }

    /**
     * Value
     * @type {Array}
     */
    get value() {
        return this._value;
    }

    /**
     * Value
     * @type {Array}
     */
    set value(value) {
        value = this._convertValue(value);

        this._value = value;
        if(this._value && this._value.length > 0) {
            this.hasContextMenu = true;
        }
        else {
            this.hasContextMenu = false;
        }

    }

    /** @private */
    _createContextMenuButton() {
        if(!this._hasContextMenu || this.Children(this._name + '-contextmenu-icon-parent')) {
            return;
        }

        this.AddClass('app-component-hascontextmenu');


        const contextMenuParent = new Colibri.UI.Pane(this._name + '-contextmenu-icon-parent', this);
        contextMenuParent.AddClass('app-contextmenu-icon-component');
        contextMenuParent.shown = true;
        contextMenuParent.AddHandler('Clicked', (event, args) => this.Dispatch('ContextMenuIconClicked', args));

        let icons = [];
        this.value.forEach((v) => {
            let icon = Colibri.UI.FileDownloadIcon;
            if(v.name && v.name.indexOf('-signed') !== -1) {
                icon = Colibri.UI.SignedFileDownloadIcon;
            }

            if(icons.indexOf(icon) == -1) {
                icons.push(icon);
                const contextMenuIcon = new Colibri.UI.Icon(this._name + '-contextmenu-icon', contextMenuParent);
                contextMenuIcon.shown = true;
                contextMenuIcon.value = icon;    
            }

        });
        
    }

    /** @private */
    _removeContextMenuButton() {
        if(this._hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
            this.RemoveClass('app-component-hascontextmenu');
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __createContextMenu(event, args) {
        let contextmenu = [];
        this.value.forEach((v) => {
            let icon = Colibri.UI.ContextMenuDownloadFileIcon;
            if(v.name && v.name.indexOf('-signed') !== -1) {
                icon = Colibri.UI.ContextMenuSignedDownloadIcon;
            }
            contextmenu.push({name: 'file' + v.guid ?? v, title: v.name ?? 'Загрузить файл', icon: icon, file: v});
        });

        this.contextmenu = contextmenu;
        this.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.LB], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clickOnContextMenu(event, args) {
        if(!args.menuData) {
            return;
        }
        const file = args.menuData.file;
        window.open((window.rpchandler ? window.rpchandler : '') + this._download + '?guid=' + (file.guid ?? file));
        
    }

    /**
     * Download url string
     * @type {string}
     */
    set download(value) {
        this._download = value;
    }
    /**
     * Download url string
     * @type {string}
     */
    get download() {
        return this._download;
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.GridFileViewer', '#{ui-viewers-gridfile}');