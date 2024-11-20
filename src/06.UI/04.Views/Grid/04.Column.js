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
    constructor(name, container, element) {
        super(name, container, Element.create('td'));
        this.AddClass('app-ui-column');
        this.AddClass('position-sticky-y');
        // this.shown = this.parent.shown;

        this.sticky = false;
        this._resizable = false;
        this._resizeHandler = null;

        this._handleEvents();

        this._editor = null;
        this._viewer = null;
        this._sortIcons = {
            asc: Colibri.UI.SortAscIcon,
            desc: Colibri.UI.SortDescIcon
        };

        this.GenerateChildren(element);

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnMoved', false, 'Поднимается, колонка сдвинута');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удалили колонку');
        this.RegisterEvent('ColumnPositionChange', false, 'Поднимается, когда колонка изменила положение липкости');
    }

    _handleEvents() {
        this.AddHandler('Clicked', (event, args) => {
            this.Dispatch('ColumnClicked', {column: this});
        });
        this.AddHandler('ComponentDisposed', (event, args) => {
            this.Dispatch('ColumnDisposed', {column: this});
        });
    }
    
    Dispose() {
        super.Dispose();
        this.Dispatch('ColumnDisposed', {column: this});
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
            this.Dispatch('ColumnStickyChange', {column: this});
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

        const stopClick = (e) => { e.preventDefault(); e.stopPropagation(); return false; };

        const startResize = (e) => {
            this._resizing = true;
            Colibri.UI.Resizing = true;
            
            const next = this.container.next().tag('component');
            if(!next) {
                return false;
            }
            const parentBounds = this.parent.container.bounds();

            this._resizeData = {width: this.container.bounds().outerWidth, nextWidth: next.container.bounds().outerWidth, full: parentBounds.outerWidth, x: e.pageX};

            // ставим на документ, чтобы точно перехватить        
            document.addEventListener("touchend", stopResize, {capture: true});
            document.addEventListener("mouseup", stopResize, {capture: true});

            document.addEventListener("touchmove", doResize, {capture: true});
            document.addEventListener("mousemove", doResize, {capture: true});

            e.preventDefault();
            e.stopPropagation();
            return false;

        };

        const stopResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
        
            this._resizing = false;
            Colibri.UI.Resizing = false;

            document.removeEventListener("touchend", stopResize, {capture: true});
            document.removeEventListener("mouseup", stopResize, {capture: true});
    
            document.removeEventListener("touchmove", doResize, {capture: true});
            document.removeEventListener("mousemove", doResize, {capture: true});

            return false;

        };

        const doResize = (e) => {
            if (this._resizing) {
                e.preventDefault();
                e.stopPropagation();

                const next = this.container.next().tag('component');
                const newWidth = (this._resizeData.width + (e.pageX - this._resizeData.x)).percentOf(this._resizeData.full);
                const newNextWidth = (this._resizeData.nextWidth - (e.pageX - this._resizeData.x)).percentOf(this._resizeData.full);

                if(newWidth < 1 || newNextWidth < 1) {
                    return false;
                }

                this.container.css('width', newWidth.toFixed(2) + '%');
                next.container.css('width', newNextWidth.toFixed(2) + '%'); 

                return false;
            }
        };

        this._resizeHandler.addEventListener("touchstart", startResize, false);
        this._resizeHandler.addEventListener("mousedown", startResize, false);
        this._resizeHandler.addEventListener("click", stopClick, false);
        this._resizeHandler.addEventListener("dblclick", stopClick, false);

    }

    _createResizeHandler() {
        this._resizeHandler = Element.create('span', {class: 'resize-border'});
        this._bindResizeEvents();
        this._element.append(this._resizeHandler);
    }

    _removeResizeHandler() {
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
        return this.parent.parent.parent.parent;
    }

    /**
     * Header
     * @type {Colibri.UI.Header}
     */
    get header() {
        return this.parent.parent;
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
        this.grid.Dispatch('ColumnEditorChanged', {column: this});
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
        this.grid.Dispatch('ColumnViewerChanged', {column: this});
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
        this.grid.Dispatch('ColumnVerticalAlignChanged', {column: this});
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
        this.grid.Dispatch('ColumnHorizontalAlignChanged', {column: this});
    }

    /**
     * Use editor allways
     * @type {Boolean}
     */
    set editorAllways(value) {
        this._editorAllways = value;
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
    }

    /**
     * Sorting icons
     * @type {Object|String}
     */
    get sortIcons() {
        if(this.grid.columnSortIcons) {
            this._sortIcons = this.grid.columnSortIcons;
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
        this.grid.Dispatch('ColumnVisibilityChanged', {column: this});   
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
    }

}