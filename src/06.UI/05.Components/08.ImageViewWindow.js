/**
 * @class
 * @extends Colibri.UI.Window
 * @memberof Colibri.UI
 */
Colibri.UI.ImageViewWindow = class extends Colibri.UI.Window {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {string} title title of window
     */
    constructor(name, container, title) {
        super(name, container, '<div><div class="content-container"><div class="text-description-before"></div><img class="image-container" src="#" alt="#"></img><div class="text-description-after"></div></div><div class="buttons-container"><button class="app-component-image-view-window-close-button">Закрыть</button></div></div>', title);
        this.AddClass('app-component-image-view-window');

        this._img = this._element.querySelector('.image-container');
        this._textDescriptionAfter = this._element.querySelector('.text-description-before');
        this._textDescriptionBefore = this._element.querySelector('.text-description-after');
        this._closeButton = this._element.querySelector('.app-component-image-view-window-close-button');

        this._handleEvents();
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ClickedCloseButton', false, 'Поднимается когда нажали на кнопку закрыть!');
    }

    _handleEvents() {
        this._closeButton.addEventListener('click', (event) => {
            this.Dispatch('ClickedCloseButton', {});
            this.Hide();
        });
    }

    get source() {
        return this._img.attr('src');
    }

    set source(value) {
        this._img.attr('src', value);
    }

    get alternativeText() {
        return this._img.attr('alt');
    }

    set alternativeText(value) {
        this._img.attr('alt', value);
    }

    get textDescriptionBefore() {
        return this._textDescriptionBefore.innerHTML;
    }

    set textDescriptionBefore(value) {
        this._textDescriptionBefore.innerHTML = value;
    }

    get textDescriptionAfter() {
        return this._textDescriptionAfter.innerHTML;
    }

    set textDescriptionAfter(value) {
        this._textDescriptionAfter.innerHTML = value;
    }

}