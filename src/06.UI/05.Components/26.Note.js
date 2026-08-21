/**
 * Note component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 * @example
 * ```
 * const note = new Colibri.UI.Note('note', this);
 * note.value = 'This is a note';
 * ```
 */
Colibri.UI.Note = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('app-component-note');

    }

}