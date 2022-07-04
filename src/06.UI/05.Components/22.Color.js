Colibri.UI.Color = class extends Colibri.UI.Component {

    endHandle = (e) => this.__gradTrackEnd(e);
    moveHandle = (e) => this.__gradTrackMove(e);
    oendHandle = (e) => this.__opacityTrackEnd(e);
    omoveHandle = (e) => this.__opacityTrackMove(e);
    sendHandle = (e) => this.__selcolTrackEnd(e);
    smoveHandle = (e) => this.__selcolTrackMove(e);

    constructor(name, container) {
        super(name, container, '<div />');
        this.AddClass('app-color-component');


        this._colorGrad = Element.create('div', {class: 'app-color-grad-component'});
        this._colorSelectedColorGrad = Element.create('div', {class: 'app-color-selected-grad-component'});
        this._colorOpacityGrad = Element.create('div', {class: 'app-color-opacity-grad-component'});
        this._colorHex = Element.create('input', {class: 'app-color-hex-component'});
        this._colorSelected = Element.create('div', {class: 'app-color-selected-component'});

        this._grid = Element.create('div', {class: 'app-color-grid-component'});
        this._element.append(this._grid);

        this._grid.append(this._colorGrad);
        this._grid.append(this._colorSelectedColorGrad);
        this._grid.append(this._colorOpacityGrad);
        this._grid.append(this._colorHex);
        this._grid.append(this._colorSelected);

        this._gradTrack = this._colorGrad.append(Element.create('div', {class: 'app-track-colorgrad-component'}));
        this._opacityTrack = this._colorOpacityGrad.append(Element.create('div', {class: 'app-track-opacitygrad-component'}));
        this._selectedColorTrack = this._colorSelectedColorGrad.append(Element.create('div', {class: 'app-track-selectedcolor-component'}));

        this._gradTrack.addEventListener('mousedown', (e) => this.__gradTrackStart(e));
        this._opacityTrack.addEventListener('mousedown', (e) => this.__opacityTrackStart(e));
        this._selectedColorTrack.addEventListener('mousedown', (e) => this.__selcolTrackStart(e));

    }

    __gradTrackStart(e) {
        const gradBounds = this._colorGrad.bounds();
        this._gradTrack.tag = {state: true, point: [e.clientX - gradBounds.left, e.clientY - gradBounds.top]};
        document.addEventListener('mouseup', this.endHandle, true);
        document.addEventListener('mousemove', this.moveHandle, true);
    }
    __gradTrackEnd(e) {
        this._gradTrack.tag = {state: false};
        document.removeEventListener('mouseup', this.endHandle, true);
        document.removeEventListener('mousemove', this.moveHandle, true);
    }
    __gradTrackMove(e) {
        if(this._gradTrack.tag.state) {
            // двигаем
            const gradBounds = this._colorGrad.bounds();
            let newLeft = (e.clientX - gradBounds.left - this._gradTrack.offsetWidth / 2);
            if(newLeft < -5) {
                newLeft = -5;
            }
            if(newLeft > gradBounds.outerWidth - 7) {
                newLeft = gradBounds.outerWidth - 7;
            }
            this._gradTrack.css('left', newLeft + 'px');
        }

    }
    
    __opacityTrackStart(e) {
        const gradBounds = this._colorOpacityGrad.bounds();
        this._opacityTrack.tag = {state: true, point: [e.clientX - gradBounds.left, e.clientY - gradBounds.top]};
        document.addEventListener('mouseup', this.oendHandle, true);
        document.addEventListener('mousemove', this.omoveHandle, true);
    }
    __opacityTrackEnd(e) {
        this._opacityTrack.tag = {state: false};
        document.removeEventListener('mouseup', this.oendHandle, true);
        document.removeEventListener('mousemove', this.omoveHandle, true);
    }
    __opacityTrackMove(e) {
        if(this._opacityTrack.tag.state) {
            // двигаем
            const gradBounds = this._colorOpacityGrad.bounds();
            let newTop = (e.clientY - gradBounds.top - this._opacityTrack.offsetHeight / 2);
            if(newTop < -5) {
                newTop = -5;
            }
            if(newTop > gradBounds.outerHeight - 7) {
                newTop = gradBounds.outerHeight - 7;
            }
            this._opacityTrack.css('top', newTop + 'px');
        }

    }

    __selcolTrackStart(e) {
        const gradBounds = this._colorSelectedColorGrad.bounds();
        this._selectedColorTrack.tag = {state: true, point: [e.clientX - gradBounds.left, e.clientY - gradBounds.top]};
        document.addEventListener('mouseup', this.sendHandle, true);
        document.addEventListener('mousemove', this.smoveHandle, true);
    }
    __selcolTrackEnd(e) {
        this._selectedColorTrack.tag = {state: false};
        document.removeEventListener('mouseup', this.sendHandle, true);
        document.removeEventListener('mousemove', this.smoveHandle, true);
    }
    __selcolTrackMove(e) {
        if(this._selectedColorTrack.tag.state) {
            // двигаем
            const gradBounds = this._colorSelectedColorGrad.bounds();
            let newTop = (e.clientY - gradBounds.top - this._selectedColorTrack.offsetHeight / 2);
            if(newTop < -5) {
                newTop = -5;
            }
            if(newTop > gradBounds.outerHeight - 7) {
                newTop = gradBounds.outerHeight - 7;
            }
            let newLeft = (e.clientX - gradBounds.left - this._selectedColorTrack.offsetWidth / 2);
            if(newLeft < -5) {
                newLeft = -5;
            }
            if(newLeft > gradBounds.outerWidth - 7) {
                newLeft = gradBounds.outerWidth - 7;
            }
            this._selectedColorTrack.css('top', newTop + 'px');
            this._selectedColorTrack.css('left', newLeft + 'px');
        }

    }

    Focus() {
        this._colorHex.focus();
        //this._colorHex.select();
    }
    
    get readonly() {
        return this._colorHex.attr('readonly') === 'readonly';
    }

    set readonly(value) {
        if(value === true || value === 'true') {
            this._colorHex.attr('readonly', 'readonly');
        }
        else {
            this._colorHex.attr('readonly', null);
        }
    }

    get placeholder() {
        return this._colorHex.attr('placeholder');
    }

    set placeholder(value) {
        this._colorHex.attr('placeholder', value);
    }

    get value() {
        let value = this._colorHex.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(this._fieldData?.params?.eval) {
            value = eval(this._fieldData?.params?.eval);
        }
        return value;
    }

    set value(value) {
        this._colorHex.value = value ?? '';
    }

    
    get enabled() {
        return this._colorHex.attr('disabled') != 'disabled';
    }

    set enabled(value) {
        if(value) {
            this.RemoveClass('app-component-disabled');
            this._colorHex.attr('disabled', null);
        }
        else {
            this.AddClass('app-component-disabled');
            this._colorHex.attr('disabled', 'disabled');
        }
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._colorHex && this._colorHex.attr('tabIndex');
    }
    set tabIndex(value) {
        this._colorHex && this._colorHex.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }


}