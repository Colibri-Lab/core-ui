/**
 * Mark down view
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 * @example
 * ```
 * const md = new Colibri.UI.MarkDown('md', this);
 * md.value = '# Heading 1\n\nThis is a paragraph with **bold** text and *italic* text.\n\n- Item 1\n- Item 2\n- Item 3';
 * 
 * in html template
 * 
 * <Colibri.UI.MarkDown name="md" value="# Heading 1\n\nThis is a paragraph with **bold** text and *italic* text.\n\n- Item 1\n- Item 2\n- Item 3" />
 * or 
 * <MarkDown name="md" value="# Heading 1\n\nThis is a paragraph with **bold** text and *italic* text.\n\n- Item 1\n- Item 2\n- Item 3" />
 * 
 * then in js
 * 
 * const md = this.Children('md');
 * ```
 */
Colibri.UI.MarkDown = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-markdown');
    }

    /**
     * Value String
     * @type {String}
     */
    get value() {
        return this._value;
    }
    /**
     * Value String
     * @type {String}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    /**
     * @ignore
     * @private
     */
    _showValue() {
        super.value = this._value.markdownToHtml();
    }

}