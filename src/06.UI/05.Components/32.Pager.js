/**
 * Pager component
 */
Colibri.UI.Pager = class extends Colibri.UI.FlexBox {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-pager');
        this._hasAffected = true;

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When page is changed');
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clicked(event, args) {

        let value = this.value;
        if(args.button.name.indexOf('-left') !== -1) {
            if(value > 1) {
                value--;
            }
        }
        else if(args.button.name.indexOf('-right') !== -1) {
            if(value < this._pages || !this._hasAffected) {
                value++;
            }
        }
        else {
            value = args.button.value;
        }

        this.Dispatch('Changed', {domEvent: args.domEvent, page: value});
    }

    set affected(value) {
        if(this._affected !== value) {
            this._affected = value;
            this._renderPages();
            this.value = 1;
        }
    }

    get affected() {
        return this._affected;
    }

    _renderButton(index, pages) {
        const button = new Colibri.UI.Button(this.name + '-' + (index === 0 ? Date.Mc() : index), this);
        button.shown = pages > 1;
        button.value = index === 0 ? '...' : index;
        button.enabled = index !== 0;
        button.AddHandler('Clicked', (event, args) => this.__clicked(event, {domEvent: args.domEvent, button: button}));
        return button;
    }

    _renderPages() {
        
        this.Clear();

        const pagesize = this._pagesize ?? 20;

        this._left = new Colibri.UI.Button(this.name + '-left', this);
        this._left.shown = !this._hasAffected || this._pages > 1;
        this._left.value = this._leftIcon ?? '';
        this._left.AddHandler('Clicked', (event, args) => this.__clicked(event, {domEvent: args.domEvent, button: this._left}));

        if(this._hasAffected) {
            
            this._pages = Math.ceil(this._affected / pagesize);
            const maxPages = this._maxPages ?? 5;

            if(this._pages > maxPages) {
    
                let startPage = this._value - 2;
                if(startPage < 1) {
                    startPage = 1;
                }
                let endPage = startPage + (maxPages - 1);
                if(endPage > this._pages) {
                    endPage = this._pages;
                    startPage = endPage - 4;
                    if(startPage < 1) {
                        startPage = 1;
                    }
                }
    
                if(startPage > 1) {
                    this._renderButton(1, this._pages);
                    this._renderButton(0, this._pages);
                }
                for(let i = startPage; i <= endPage; i++) {
                    this._renderButton(i, this._pages);
                }
                if(endPage < this._pages - 1) {
                    this._renderButton(0, this._pages);
                }
                if(endPage < this._pages) {
                    this._renderButton(this._pages, this._pages);
                }
                
            } else {
    
                for(let i=1; i <= this._pages; i++) {
                    this._renderButton(i, this._pages);
                }
            }
    
        } else {
            this._info = new Colibri.UI.Button(this.name + '-info', this);
            this._info.shown = !this._hasAffected;
            this._info.value = this._value ?? 1;
        }
        
        this._right = new Colibri.UI.Button(this.name + '-right', this);
        this._right.shown = !this._hasAffected || this._pages > 1;
        this._right.value = this._rightIcon ?? '';
        this._right.AddHandler('Clicked', (event, args) => this.__clicked(event, {domEvent: args.domEvent, button: this._right}));

        this._showValue();
        
    }

    set value(value) {
        if(this._value != value) {
            this._value = parseInt(value);
            this._renderPages();
        }
    }

    get value() {
        return this._value ?? 1;
    }

    _showValue() {
        if(this.children === 0 || !this._value) {
            return;
        }
        try {
            this.Children(this.name + '-left').enabled = this._value !== 1;
            this.Children(this.name + '-right').enabled = this._hasAffected ? (this._value !== this._pages) : true;
            this.ForEach((name, component) => component.RemoveClass('-selected'));
            this.Children(this._name + '-' + this._value).AddClass('-selected');    
        }
        catch(e) {}
    }

    /**
     * Page size
     * @type {Number}
     */
    get pagesize() {
        return this._pagesize;
    }
    /**
     * 
     * @type {Number}
     */
    set pagesize(value) {
        this._pagesize = value;
        this._renderPages();
    }

    /**
     * Icon for left arrow
     * @type {String}
     */
    get leftIcon() {
        return this._left.value;
    }
    /**
     * Icon for left arrow
     * @type {String}
     */
    set leftIcon(value) {
        this._leftIcon = eval(value);
        this._showLeftIcon();
    }
    _showLeftIcon() {
        if(this._left) {
            this._left.value = this._leftIcon;
        }
    }

    /**
     * Right icon
     * @type {String}
     */
    get rightIcon() {
        return this._rightIcon;
    }
    /**
     * Right icon
     * @type {String}
     */
    set rightIcon(value) {
        this._rightIcon = eval(value);
        this._showRightIcon();
    }
    _showRightIcon() {
        if(this._right) {
            this._right.value = this._rightIcon;
        }
    }
    
    /**
     * Maximum pages shown in pager
     * @type {Number}
     */
    get maxPages() {
        return this._maxPages;
    }
    /**
     * Maximum pages shown in pager
     * @type {Number}
     */
    set maxPages(value) {
        this._maxPages = value;
        this._renderPages();
    }
    
    /**
     * Has affected rows
     * @type {Boolean}
     */
    get hasAffected() {
        return this._hasAffected;
    }
    /**
     * Has affected rows
     * @type {Boolean}
     */
    set hasAffected(value) {
        value = this._convertProperty('Boolean', value);
        this._hasAffected = value;
    }
    
}