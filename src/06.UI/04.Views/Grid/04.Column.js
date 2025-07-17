/**
 * Grid header column component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Column = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container, element, attrs = {}) {
        super(name, container, Element.create('td'));
        this.AddClass('app-ui-column');
        this.AddClass('position-sticky-y');
        // this.shown = this.parent.shown;

        this._sticky = false;
        this._resizable = false;
        this._resizeHandler = null;

        this._editor = null;
        this._viewer = null;
        this._sortIcons = {
            asc: Colibri.UI.SortAscIcon,
            desc: Colibri.UI.SortDescIcon
        };

        this._valueContainer = Element.create('span', {class: 'value-container'});
        this._element.append(this._valueContainer);

        this.GenerateChildren(element);

        Object.forEach(attrs, (n, v) => {
            this[n] = v;
        });

        if(container instanceof Colibri.UI.Component) {
            container.Dispatch('ChildAdded', {column: this});
        }

    }
    
    _registerEventHandlers() {
        super._registerEventHandlers();
        this.AddHandler('Clicked', this.__thisClicked);
        this.AddHandler('ComponentMoved', this.__thisComponentMoved);
    }

    Dispose() {
        this.grid?.Dispatch('ColumnDisposed', {column: this});
        this.resizable = false;
        super.Dispose();
    }

    __thisComponentMoved(event, args) {
        this.grid?.Dispatch('ColumnMoved', {column: this});        
    }

    __thisClicked(event, args) {
        this.grid?.Dispatch('ColumnClicked', {column: this})
    }
    

    /**
     * Set and get the column sticky
     * @type {Boolean}
     */
    get sticky() {
        return this._sticky;
    }
    /**
     * Set and get the column sticky
     * @type {Boolean}
     */
    set sticky(value) {
        if (value === 'true' || value === true) {
            this.AddClass('position-sticky-x');
        } else {
            this.RemoveClass('position-sticky-x');
            this._element.style.left = '';
        }

        if (this._sticky !== (value === 'true' || value === true)) {
            this._sticky = (value === 'true' || value === true);
            this.grid?.Dispatch('ColumnPropertyChanged', {column: this, property: 'sticky'});
        }
    }

    /**
     * Set and get the column resizable
     * @type {Boolean}
     */
    get resizable() {
        return this._resizable;
    }
    /**
     * Set and get the column resizable
     * @type {Boolean}
     */
    set resizable(value) {
        value = (value === 'true' || value === true);
        this._resizable = value;
        if(this._resizable) {
            this._createResizeHandler();
        }
        else {
            this._removeResizeHandler();
        }
    }

    /**
     * Set and get the column sortable
     * @type {Boolean}
     */
    get sortable() {
        return this._sortable;
    }
    /**
     * Set and get the column sortable
     * @type {Boolean}
     */
    set sortable(value) {
        value = (value === 'true' || value === true);
        this._sortable = value;
        if(this._sortable) {
            this._createSortHandler();
        }
        else {
            this._removeSortHandler();
        }
    }

    /**
     * Sort state
     * @type {String}
     */
    get sortState() {
        return this._sortState;
    }
    /**
     * Sort state
     * @type {asc,desc}
     */
    set sortState(value) {
        this._sortState = value;
        this._sortHandler && this._sortHandler.html(this.sortIcons[value ? value : 'none'] ?? '');
    }

    _bindResizeEvents() {

        this._stopClick = (e) => { e.preventDefault(); e.stopPropagation(); return false; };

        this._startResize = this._startResize ?? ((e) => {
            this._resizing = true;
            Colibri.UI.Resizing = true;
            
            // const next = this.container.next().getUIComponent();
            const next = this.container.next().getUIComponent();
            if(!next) {
                return false;
            }
            const parentBounds = this.parent.container.bounds();

            this._resizeData = {width: this.container.bounds().outerWidth, nextWidth: next.container.bounds().outerWidth, full: parentBounds.outerWidth, x: e.pageX};

            // ставим на документ, чтобы точно перехватить        
            document.addEventListener("touchend", this._stopResize, {capture: true});
            document.addEventListener("mouseup", this._stopResize, {capture: true});

            document.addEventListener("touchmove", this._doResize, {capture: true});
            document.addEventListener("mousemove", this._doResize, {capture: true});

            e.preventDefault();
            e.stopPropagation();
            return false;

        });

        this._stopResize = this._stopResize ?? ((e) => {
            e.preventDefault();
            e.stopPropagation();
        
            this._resizing = false;
            Colibri.UI.Resizing = false;

            document.removeEventListener("touchend", this._stopResize, {capture: true});
            document.removeEventListener("mouseup", this._stopResize, {capture: true});
    
            document.removeEventListener("touchmove", this._doResize, {capture: true});
            document.removeEventListener("mousemove", this._doResize, {capture: true});

            return false;

        });

        this._doResize = this._doResize ?? ((e) => {
            if (this._resizing) {
                e.preventDefault();
                e.stopPropagation();

                // const next = this.container.next().getUIComponent();
                const next = this.container.next().getUIComponent();
                const newWidth = (this._resizeData.width + (e.pageX - this._resizeData.x)).percentOf(this._resizeData.full);
                const newNextWidth = (this._resizeData.nextWidth - (e.pageX - this._resizeData.x)).percentOf(this._resizeData.full);

                if(newWidth < 1 || newNextWidth < 1) {
                    return false;
                }

                this.container.css('width', newWidth.toFixed(2) + '%');
                next.container.css('width', newNextWidth.toFixed(2) + '%'); 

                return false;
            }
        });

        this._resizeHandler.addEventListener("touchstart", this._startResize, false);
        this._resizeHandler.addEventListener("mousedown", this._startResize, false);
        this._resizeHandler.addEventListener("click", this._stopClick, false);
        this._resizeHandler.addEventListener("dblclick", this._stopClick, false);

    }

    _createResizeHandler() {
        this._resizeHandler = Element.create('span', {class: 'resize-border'});
        this._bindResizeEvents();
        this._element.append(this._resizeHandler);
    }

    _removeResizeHandler() {
        
        this._resizeHandler && document.removeEventListener("touchend", this._stopResize, {capture: true});
        this._resizeHandler && document.removeEventListener("mouseup", this._stopResize, {capture: true});
        this._resizeHandler && document.removeEventListener("touchmove", this._doResize, {capture: true});
        this._resizeHandler && document.removeEventListener("mousemove", this._doResize, {capture: true});
        this._resizeHandler && this._resizeHandler.removeEventListener("touchstart", this._startResize, false);
        this._resizeHandler && this._resizeHandler.removeEventListener("mousedown", this._startResize, false);
        this._resizeHandler && this._resizeHandler.removeEventListener("click", this._stopClick, false);
        this._resizeHandler && this._resizeHandler.removeEventListener("dblclick", this._stopClick, false);
        this._resizeHandler && this._resizeHandler.remove();
    }

    _createSortHandler() {
        this.AddClass('-sortable');
        this._sortHandler = Element.create('span', {class: 'sort-handler'});
        this._sortHandler.html(this.sortIcons['none'] ?? '');
        this._element.append(this._sortHandler);
    }

    _removeSortHandler() {
        this._sortHandler && this._sortHandler.remove();
        this.RemoveClass('-sortable');
    }

    /**
     * Grid
     * @type {Colibri.UI.Grid}
     */
    get grid() {
        return this.parent?.parent?.parent?.parent;
    }

    /**
     * Header
     * @type {Colibri.UI.Header}
     */
    get header() {
        return this?.parent?.parent;
    }

    /**
     * Editor component
     * @type {Colibri.UI.Component}
     */
    get editor() {
        return this._editor;
    }
    /**
     * Editor component
     * @type {Colibri.UI.Component}
     */
    set editor(value) {
        this._editor = value;
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'editor', column: this});
    }

    /**
     * Viewer component
     * @type {Colibri.UI.Component}
     */
    get viewer() {
        return this._viewer;
    }
    /**
     * Viewer component
     * @type {Colibri.UI.Component}
     */
    set viewer(value) {
        this._viewer = value;
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'viewer', column: this});
    }

    /**
     * Column vertical align
     * @type {bottom,middle,sub,super,text-bottom,text-top,top,auto}
     */
    get valign() {
        return this._valign;
    }
    /**
     * Column vertical align
     * @type {bottom,middle,sub,super,text-bottom,text-top,top,auto}
     */
    set valign(value) {
        this._valign = value;
        this._element.css('vertical-align', value);
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'valign', column: this});
    }

    /**
     * Column horizontal align
     * @type {center,end,justify,left,right,start}
     */
    get halign() {
        return this._halign;
    }
    /**
     * Column horizontal align
     * @type {center,end,justify,left,right,start}
     */
    set halign(value) {
        this._halign = value;
        this._element.css('text-align', value);
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'halign', column: this});
    }

    /**
     * Use editor allways
     * @type {Boolean}
     */
    set editorAllways(value) {
        value = this._convertProperty('Boolean', value);
        this._editorAllways = value;
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'editorAllways', column: this});
    }
    /**
     * Use editor allways
     * @type {Boolean}
     */
    get editorAllways() {
        return this._editorAllways;
    }

    /**
     * Download controller
     * @type {String}
     */
    set download(value) {
        this._download = value;
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'download', column: this});
    }
    /**
     * Download controller
     * @type {String}
     */
    get download() {
        return this._download;
    }
    
    /**
     * Gets/Sets rows span of column (in header)
     * @type {Number}
     */
    get rowspan() {
        return this._element.attr('rowspan');
    }
    /**
     * Gets/Sets rows span of column (in header)
     * @type {Number}
     */
    set rowspan(value) {
        this._element.attr('rowspan', value);
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'rowspan', column: this});
    }

    /**
     * Gets/Sets column span of column (in header)
     * @type {Number}
     */
    get colspan() {
        return this._element.attr('colspan');
    }
    /**
     * Gets/Sets column span of column (in header)
     * @type {Number}
     */
    set colspan(value) {
        this._element.attr('colspan', value);
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'colspan', column: this});
    }

    /**
     * Index of column, if header has multiple rows
     * @type {Number}
     */
    get index() {
        return this._index;
    }
    /**
     * Index of column, if header has multiple rows
     * @type {Number}
     */
    set index(value) {
        this._index = value;
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'index', column: this});
    }

    /**
     * Sorting icons
     * @type {Object|String}
     */
    get sortIcons() {
        if(this.grid?.columnSortIcons) {
            this._sortIcons = this.grid?.columnSortIcons;
        }
        return this._sortIcons;
    }
    /**
     * Sorting icons
     * @type {Object|String}
     */
    set sortIcons(value) {
        if(typeof value === 'string') {
            value = eval(value);
        }
        this._sortIcons = value;
        this._sortHandler && this._sortHandler.html(this.sortIcons['none'] ?? '');
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'sortIcons', column: this});

    }

    /**
     * Hide and show column
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }
    /**
     * Hide and show column
     * @type {boolean}
     */
    set shown(value) {
        super.shown = value;
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'shown', column: this});
    }

    /**
     * Value can be copied, works when viewer is not set
     * @type {Boolean}
     */
    get canCopy() {
        return this._canCopy;
    }
    /**
     * Value can be copied, works when viewer is not set
     * @type {Boolean}
     */
    set canCopy(value) {
        this._canCopy = value;
        this.grid?.Dispatch('ColumnPropertyChanged', {property: 'canCopy', column: this});
    }

    /**
     * Value String
     * @type {String}
     */
    get value() {
        return this._valueContainer.html();
    }
    /**
     * Value String
     * @type {String}
     */
    set value(value) {
        this._valueContainer.html(value);
    }



}