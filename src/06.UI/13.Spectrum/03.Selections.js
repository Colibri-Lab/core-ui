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
        if (isCentered) {
            selectionElement.AddClass('-centered');
        }
        const icon = new Colibri.UI.Icon('close-icon', selectionElement);
        icon.shown = true;
        icon.iconSVG = 'Colibri.UI.CloseIcon';
        selectionElement.AddHandler('DoubleClicked', (event, args) => selectionElement.Dispose());
        icon.AddHandler('Clicked', (event, args) => selectionElement.Dispose());
        selectionElement.AddHandler('SizeChanging', (event, args) => {
            if(event.sender.tag.mode === 'select-column') {
                args.height = event.sender.height;
                args.top = 0;
            } else if(event.sender.tag.mode === 'select-row') {
                args.width = event.sender.width;
                args.left = 0;
            }

            if (event.sender.tag.isCentered) {
                if(event.sender.tag.mode === 'select-column') {
                    if(args.direction === 'e') {
                        args.left -= args.delta.left;
                        args.width += args.delta.left;
                    } else if(args.direction === 'w') {
                        args.width -= args.delta.left;
                    }
                } else if(event.sender.tag.mode === 'select-row') {
                    if(args.direction === 's') {
                        args.top -= args.delta.top;
                        args.height += args.delta.top;
                    } else if(args.direction === 'n') {
                        args.height -= args.delta.top;
                    }
                }
            }

        });

        return selectionName;
    }

    Update(selectionName, selectionPointOrRect) {
        const selectionElement = this.Children(selectionName);
        if (selectionElement) {
            const rect = {
                left: selectionPointOrRect.left,
                top: selectionPointOrRect.top,
                width: (selectionPointOrRect.width || 0),
                height: (selectionPointOrRect.height || 0)
            };
            if (selectionElement.tag?.mode === 'select-column') {
                rect.top = 0;
                rect.height = this.height;
                if (selectionElement.tag?.isCentered) {
                    rect.left = (selectionPointOrRect.left - selectionPointOrRect.width);
                    rect.width = (selectionPointOrRect.width * 2);
                }
            } else if (selectionElement.tag?.mode === 'select-row') {
                rect.left = 0;
                rect.width = this.width;
                if (selectionElement.tag?.isCentered) {
                    rect.top = (selectionPointOrRect.top - selectionPointOrRect.height);
                    rect.height = (selectionPointOrRect.height * 2);
                }
            }
            selectionElement.styles = {
                left: rect.left + 'px',
                top: rect.top + 'px',
                width: rect.width + 'px',
                height: rect.height + 'px'
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