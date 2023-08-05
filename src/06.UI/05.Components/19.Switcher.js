Colibri.UI.Switcher = class extends Colibri.UI.Component {
    constructor(name, container, data) {
        super(name, container, Element.create('div'));

        this.AddClass('app-component-switcher');

        const d = data ? data : [{title: '—', data: {}}];

        this.infinitySwitching = false;

        this._text = new Colibri.UI.TextSpan('text', this, d[0].title);
        this._text.AddClass('text');
        this._text.shown = true;

        this._prevButton = new Colibri.UI.Icon('prev-button', this);
        this._prevButton.AddClass('prev-button');
        this._prevButton.value = Colibri.UI.LeftArrowIcon;
        this._prevButton.shown = true;

        this._nextButton = new Colibri.UI.Icon('next-button', this);
        this._nextButton.AddClass('next-button');
        this._nextButton.value = Colibri.UI.RightArrowIcon;
        this._nextButton.shown = true;

        this.items = d;
        this.itemIndex = 0;

        this._prevButton.AddHandler('Clicked', () => {
            this.itemIndex--;
            this.Dispatch('ButtonClicked', {button: 'prevButton', itemIndex: this.itemIndex});
            this.Dispatch('Changed', this.items[this._itemIndex]);
        });

        this._nextButton.AddHandler('Clicked', () => {
            this.itemIndex++;
            this.Dispatch('ButtonClicked', {button: 'nextButton', itemIndex: this.itemIndex});
            this.Dispatch('Changed', this.items[this._itemIndex]);
        });

    }

    _registerEvents() {
        this.RegisterEvent('Changed', false, 'Поднимается когда происходи изменение');
        this.RegisterEvent('ButtonClicked', false, 'Поднимается когда происходит нажатие на кнопку пред/след');
    }

    /**
     * Selected item value
     * @type {any}
     */
    get itemValue() {
        try {
            return this.items[this._itemIndex].value;
        } catch(e) {
            return null;
        }
    }
    /**
     * Selected item value
     * @type {any}
     */
    set itemValue(value) {
        let itemIndex = Array.findIndex(this._items, v => v?.value === value);
        if(itemIndex === -1) {
            itemIndex = 0;
        }
        this.itemIndex = itemIndex;
    }


    /**
     * Selected item index
     * @type {Number}
     */
    get itemIndex() {
        return this._itemIndex;
    }

    /**
     * Selected item index
     * @type {Number}
     */
    set itemIndex(value) {
        if (value >= 0 && value <= (this._items.length - 1)) {
            this._itemIndex = value;
        } else {
            this._itemIndex = 0;
        }
        this._showItemIndex();
    }

    _showItemIndex() {
        if(!this._items) {
            return ;
        }

        this._text.value = this.items[this._itemIndex].title;
        if (this.infinitySwitching) {
            this._prevButton.RemoveClass('disabled');
            this._nextButton.RemoveClass('disabled');
        } else {
            if (this._itemIndex === 0) {
                this._prevButton.AddClass('disabled');
            } else if (this._itemIndex === (this.items.length - 1)) {
                this._nextButton.AddClass('disabled');
            } else {
                this._prevButton.RemoveClass('disabled');
                this._nextButton.RemoveClass('disabled');
            }
        }

    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._text.value = value[0].title;
        this._items = value;
        // this.Dispatch('Changed', this.items[0]);
    }

    /**
     * Indicates when the swithing process is cycled
     * @type {Boolean}
     */
    get infinitySwitching() {
        return this._infinitySwitching;
    }
    /**
     * Indicates when the swithing process is cycled
     * @type {Boolean}
     */
    set infinitySwitching(value) {
        this._infinitySwitching = value === 'true' || value === true;
        if (value) {
            this._prevButton.RemoveClass('disabled');
            this._nextButton.RemoveClass('disabled');
        }
    }

    /**
     * Left arrow icon
     * @type {String}
     */
    get leftArrowIcon() {
        return this._prevButton.iconSVG;
    }
    /**
     * Left arrow icon
     * @type {String}
     */
    set leftArrowIcon(value) {
        this._prevButton.iconSVG = value;
    }

    /**
     * Right arrow icon
     * @type {String}
     */
    get rightArrowIcon() {
        return this._nextButton.iconSVG;
    }
    /**
     * Right arrow icon
     * @type {String}
     */
    set rightArrowIcon(value) {
        this._nextButton.iconSVG = value;
    }
    

}