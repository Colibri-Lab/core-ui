/**
 * Класс колонки
 */
Colibri.UI.Grid.Column = class extends Colibri.UI.Component {

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

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
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

    get sticky() {
        return this._sticky;
    }

    set sticky(value) {
        if (value) {
            this.AddClass('position-sticky-x');
        } else {
            this.RemoveClass('position-sticky-x');
            this._element.style.left = '';
        }

        if (this._sticky !== value) {
            this._sticky = value;
            this.Dispatch('ColumnStickyChange', {column: this});
        }
    }

    get resizable() {
        return this._resizable;
    }

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

    get sortable() {
        return this._sortable;
    }

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

    get sortState() {
        return this._sortState;
    }
    set sortState(value) {
        this._sortState = value;
        this._sortHandler && this._sortHandler.html(value ? this._sortIcons[value] : '');
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
        this._sortHandler = Element.create('span', {class: 'sort-handler'});
        this._element.append(this._sortHandler);
    }

    _removeSortHandler() {
        this._sortHandler && this._sortHandler.remove();
    }

    get grid() {
        return this.parent;
    }

    get editor() {
        return this._editor;
    }
    set editor(value) {
        this._editor = value;
        this.grid.Dispatch('ColumnEditorChanged', {column: this});
    }

    get viewer() {
        return this._viewer;
    }
    set viewer(value) {
        this._viewer = value;
        this.grid.Dispatch('ColumnViewerChanged', {column: this});
    }

    get valign() {
        return this._valign;
    }
    set valign(value) {
        this._valign = value;
        this.grid.Dispatch('ColumnVerticalAlignChanged', {column: this});
    }

    get halign() {
        return this._halign;
    }
    set halign(value) {
        this._halign = value;
        this.grid.Dispatch('ColumnHorizontalAlignChanged', {column: this});
    }

    set editorAllways(value) {
        this._editorAllways = value;
    }
    
    get editorAllways() {
        return this._editorAllways;
    }

    set download(value) {
        this._download = value;
    }

    get download() {
        return this._download;
    }


}