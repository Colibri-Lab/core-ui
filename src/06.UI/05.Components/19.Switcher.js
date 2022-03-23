Colibri.UI.Switcher = class extends Colibri.UI.Component {
    constructor(name, container, data) {
        super(name, container, '<div />');

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
            this.Dispatch('ButtonClicked', {button: 'prevButton', itemIndex: this.itemIndex});
            this.itemIndex--;
        });

        this._nextButton.AddHandler('Clicked', () => {
            this.Dispatch('ButtonClicked', {button: 'nextButton', itemIndex: this.itemIndex});
            this.itemIndex++;
        });

    }

    _registerEvents() {
        this.RegisterEvent('Changed', false, 'Поднимается когда происходи изменение');
        this.RegisterEvent('ButtonClicked', false, 'Поднимается когда происходит нажатие на кнопку пред/след');
    }

    get itemIndex() {
        return this._itemIndex;
    }

    set itemIndex(value) {
        if(!this.items) {
            return ;
        }

        if (value >= 0 && value <= (this.items.length - 1)) {
            this._itemIndex = value;
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
        this.Dispatch('Changed', this.items[this._itemIndex]);
    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._text.value = value[0].title;
        this._items = value;
        this.Dispatch('Changed', this.items[0]);
    }

    get infinitySwitching() {
        return this._infinitySwitching
    }

    set infinitySwitching(value) {
        this._infinitySwitching = value;
        if (value) {
            this._prevButton.RemoveClass('disabled');
            this._nextButton.RemoveClass('disabled');
        }
    }

}