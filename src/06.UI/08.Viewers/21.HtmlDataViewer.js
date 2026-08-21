/**
 * Html data viewer component
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 * @example
 * ```
 * const htmlDataViewer = new Colibri.UI.HtmlDataViewer('htmlDataViewer', this);
 * htmlDataViewer.value = '<p>This is <strong>HTML</strong> content.</p>';
 * htmlDataViewer.strip = true; // will strip HTML tags and show only text
 * htmlDataViewer.strip = false; // will show HTML content as is
 * ```
 */
Colibri.UI.HtmlDataViewer = class extends Colibri.UI.Viewer {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-htmldata-viewer-component');
        this._strip = true;
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return super.value;
    }
    /**
     * Value
     * @type {string}
     */
    set value(value) {
        let v = !value ? '&mdash;' : (Lang ? Lang.Translate(value) : value).replaceAll(/\n/g, '<br />');
        if((this._strip ?? true)) {
            v = v.stripHtml().words(20);
        }
        super.value = v;
    }

    /**
     * 
     * @type {Boolean}
     */
    get strip() {
        return this._strip;
    }
    /**
     * 
     * @type {Boolean}
     */
    set strip(value) {
        value = this._convertProperty('Boolean', value);
        this._strip = value;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.HtmlDataViewer', '#{ui-viewers-htmldata}');