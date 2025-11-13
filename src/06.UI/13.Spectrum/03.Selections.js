/**
 * Selections
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Spectrum
 */
Colibri.UI.Spectrum.Selections = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Spectrum.Selections']);
        this.AddClass('colibri-ui-spectrum-selections');


    }

    Add(selectionPointOrRect) {
        const selectionName = 'selection-' + Date.Mc();
        const selectionElement = new Colibri.UI.Pane(selectionName, this);
        selectionElement.AddClass('colibri-ui-spectrum-selections-selection');
        selectionElement.shown = true;
        selectionElement.styles = { left: selectionPointOrRect.left + 'px', top: selectionPointOrRect.top + 'px', width: (selectionPointOrRect.width || 0) + 'px', height: (selectionPointOrRect.height || 0) + 'px' };
        selectionElement.movable = true;
        selectionElement.resizable = true;
        selectionElement.AddHandler('DoubleClicked', (event, args) => selectionElement.Dispose());
        return selectionName;
    }

    Update(selectionName, selectionPointOrRect) {
        const selectionElement = this.Children(selectionName);
        if (selectionElement) {
            selectionElement.styles = { left: selectionPointOrRect.left + 'px', top: selectionPointOrRect.top + 'px', width: (selectionPointOrRect.width || 0) + 'px', height: (selectionPointOrRect.height || 0) + 'px' };
        }
    }

    Remove(selectionName) {
        const selectionElement = this.Children(selectionName);
        console.log(selectionName, selectionElement);
        if (selectionElement) {
            selectionElement.Dispose();
        }
    }


}