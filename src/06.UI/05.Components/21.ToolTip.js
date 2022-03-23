
Colibri.UI.ToolTip = class extends Colibri.UI.Component {

    static LeftTop = 'left top';
    static RightTop = 'right top';
    static RightBottom = 'right bottom';
    static LeftBottom = 'left bottom';
    static Left = 'left';
    static Right = 'right';



    constructor(name, container) {
        super(name, container, '<div><em></em></div>');

        this.AddClass('app-tooltip-component');
        this._closable = true;
        this.closeOnShadow = true;

        this._closedButton = new Colibri.UI.Pane(this.name + '-close-button-container', this._element);
        this._closedButton.AddClass('app-component-close-button-container')
        this._closedButton.shown = this._closable;

        this._icon = new Colibri.UI.Icon(this.name + '-icon-container', this._closedButton)
        this._icon.value = Colibri.UI.CloseIcon;
        this._icon.shown = this._closable;

        this._messageContainer = new Colibri.UI.Pane(this.name + '-message-container', this._element);
        this._messageContainer.AddClass('app-component-message-container');
        this._messageContainer.shown = true;

        this._actionContainer = new Colibri.UI.Pane(this.name + '-action-container', this._element);
        this._actionContainer.AddClass('app-component-action-container');
        this._actionContainer.shown = true;

        this._icon.AddHandler('Clicked', (event, args) => this.__CloseByClick(event, args));
        this.AddHandler('ShadowClicked', () => this.closeOnShadow ? this.Hide() : false);

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('WindowClosed', false, 'Поднимается когда окно закрылось');
        this.RegisterEvent('WindowContentRendered', false, 'Когда содержание окна отрисовалось');
    }

    __CloseByClick(event, args) {
        if (this._closable === true) {
            this.shown = false;
            this.Dispatch('WindowClosed', {});
        }
    }

    get orientation() {
        return this._orientation;
    }

    set orientation(value) {
        this._orientation = value;
    }

    _setPosition(handleComponent, orientation = Colibri.UI.ToolTip.Right) {
        // координаты подсказки 
        const parentBounds = this.parent.container.bounds(true);
        const tipBounds = this.container.bounds(true);
        // координаты стрелки на подсказке
        const arrow = this._element.querySelector(':scope > em');
        // координаты родителя подсказки
        const handleComponentBounds = handleComponent.container.bounds(true);

        switch (orientation) {
            default:
            case 'left bottom': {
                // меняю положение превдоэлемента 'before' (стрелка подсказки)
                this._getSelectorSearch('bottom');
                // меняю положение подсказки относительно родительского элемента
                this.styles = {
                    left: handleComponentBounds.left + 'px',
                    top: handleComponentBounds.top + handleComponentBounds.height + arrow.offsetHeight + 'px'
                };
                break;
            }
            case 'right top': {
                this._getSelectorSearch('top');
                this.styles = {
                    left: (((handleComponentBounds.left + handleComponentBounds.width) - tipBounds.width)) + 'px',
                    top: (handleComponentBounds.top - (tipBounds.height + arrow.offsetHeight)) + 'px'
                };
                break;
            }
            case 'right bottom': {
                this._getSelectorSearch('bottom');
                this.styles = {
                    left: handleComponentBounds.left + (handleComponentBounds.width - tipBounds.width) + 'px',
                    top: handleComponentBounds.top + handleComponentBounds.height + arrow.offsetHeight + 'px'
                };
                break;
            }
            case 'left top': {
                this._getSelectorSearch('top');
                this.styles = {
                    left: handleComponentBounds.left + 'px',
                    top: handleComponentBounds.top - (tipBounds.height + arrow.offsetHeight) + 'px'
                };
                break;
            }
            case 'right': {
                this._getSelectorSearch('right');
                this.styles = {
                    left: handleComponentBounds.left + handleComponentBounds.width + arrow.offsetWidth + 'px',
                    top: (handleComponentBounds.top + (handleComponentBounds.height / 2)) - ((arrow.offsetHeight / 2) + parseInt(arrow.css('top'))) + 'px',
                };
                break;
            }
            case 'left': {
                this._getSelectorSearch('left');
                this.styles = {
                    left: (handleComponentBounds.left - (tipBounds.width + arrow.offsetWidth)) + 'px',
                    top: (handleComponentBounds.top + (handleComponentBounds.height / 2)) - ((arrow.offsetHeight / 2) + parseInt(arrow.css('top'))) + 'px'
                };
                break;
            }
        }
    }

    set content(value) {
        this._messageContainer.value = value;
    }

    get content() {
        return this._messageContainer;
    }
    get actions() {
        return this._actionContainer;
    }

    get closable() {
        return this._closable;
    }

    set closable(value) {
        this._closable = value === true || value === 'true';
        this._closedButton.shown = this._closable;
    }

    get closeOnShadow() {
        return this._closeOnShadow;
    }

    set closeOnShadow(value) {
        this._closeOnShadow = value === true || value === 'true';
    }

    get value() {
        return this._messageContainer.html();
    }
    set value(value) {
        this._messageContainer.html(value);
    }

    get shown() {
        return super.shown;
    }

    set shown(value) {
        super.shown = value;
        if (super.shown) {
            this.BringToFront();
            this.hasShadow = value;
        } else {
            this.SendToBack();
        }
        if (this._closeOnShadow) {
            this.hasShadow = super.shown;
        }
    }

    // метод для изменения свойств превдоэлемента 'before'
    _getSelectorSearch(position, top, right, bottom, left) {

        this.RemoveClass('top').RemoveClass('left').RemoveClass('right').RemoveClass('bottom');
        this.AddClass(position);


        const em = this._element.querySelector(':scope > em');
        const css = em.css();
        if (position === 'left') {
            em.css({
                'top': parseInt(css['border-top-width']) / 3 + 'px',
                'right': parseInt(css['border-top-width']) * -1 + 'px'
            })
        }
        if (position === 'right') {
            console.log('inside right===>');
            em.css({
                'top': parseInt(css['border-top-width']) / 3 + 'px',
                'left': parseInt(css['border-top-width']) * -1 + 'px'
            });
            console.log('===>', em.css(['top']));
        }
        if (position === 'bottom') {
            em.css({
                'top': parseInt(css['border-bottom-width']) * -1 + 'px'
                // 'right': parseInt(css['border-bottom-width'])/3 + 'px'
            });
        }
        if (position === 'top') {
            em.css({
                // 'right': parseInt(css['border-top-width'])*2 /3 + 'px',
                'bottom': parseInt(css['border-top-width']) * -1 + 'px'
            });
        }

        return;
    }

    Show(handleComponent, orientation = Colibri.UI.ToolTip.Right, message = '', buttons = [], closable = true, closeOnShadow = true) {

        return new Promise((resolve, reject) => {

            this.closable = closable;
            this.closeOnShadow = closeOnShadow;

            if (message) {
                this._messageContainer.Clear();
                this._messageContainer.container.html(message);
            }

            if (buttons.length > 0) {
                this._actionContainer.Clear();
                buttons.forEach((button) => {
                    const b = new Colibri.UI.Button(button.name, this._actionContainer);
                    b.value = button.title;
                    b.shown = true;
                    if (button.class) {
                        b.AddClass(button.class);
                    }
                    b.AddHandler('Clicked', (event, args) => {
                        resolve(b.name);
                    });
                });
            }

            this.shown = true;
            if (super.shown) {
                this._element.css('visibility', 'hidden');
                Colibri.Common.Delay(100).then(() => {
                    this._setPosition(handleComponent, orientation);
                    this._element.css('visibility', 'visible');
                });
            }
        });

    }

}
