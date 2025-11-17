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

    Add(selectionPointOrRect, mode, isCentered) {
        const selectionName = 'selection-' + Date.Mc();
        const selectionElement = new Colibri.UI.Pane(selectionName, this);
        selectionElement.AddClass('colibri-ui-spectrum-selections-selection');
        selectionElement.shown = true;
        selectionElement.styles = { left: selectionPointOrRect.left + 'px', top: selectionPointOrRect.top + 'px', width: (selectionPointOrRect.width || 0) + 'px', height: (selectionPointOrRect.height || 0) + 'px' };
        selectionElement.movable = true;
        selectionElement.resizable = true;
        selectionElement.tag = { mode: mode, isCentered: isCentered };
        selectionElement.AddClass('-' + mode);
        if(isCentered) {
            selectionElement.AddClass('-centered');
        }
        const icon = new Colibri.UI.Icon('close-icon', selectionElement);
        icon.shown = true;
        icon.iconSVG = 'Colibri.UI.CloseIcon';
        selectionElement.AddHandler('DoubleClicked', (event, args) => selectionElement.Dispose());
        icon.AddHandler('Clicked', (event, args) => selectionElement.Dispose());

        return selectionName;
    }

    Update(selectionName, selectionPointOrRect) {
        const selectionElement = this.Children(selectionName);
        if (selectionElement) {
            const rect = {
                left: selectionPointOrRect.left + 'px',
                top: selectionPointOrRect.top + 'px',
                width: (selectionPointOrRect.width || 0) + 'px',
                height: (selectionPointOrRect.height || 0) + 'px'
            };
            if(selectionElement.tag?.mode === 'select-column') {
                rect.top = '0px';
                rect.height = this.height + 'px';
                if(selectionElement.tag?.isCentered) {
                    rect.left = (selectionPointOrRect.left - selectionPointOrRect.width) + 'px';
                    rect.width = (selectionPointOrRect.width * 2) + 'px';
                }
            } else if(selectionElement.tag?.mode === 'select-row') {
                rect.left = '0px';
                rect.width = this.width + 'px';
                if(selectionElement.tag?.isCentered) {
                    rect.top = (selectionPointOrRect.top - selectionPointOrRect.height) + 'px';
                    rect.height = (selectionPointOrRect.height * 2) + 'px';
                }
            }
            selectionElement.styles = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };
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