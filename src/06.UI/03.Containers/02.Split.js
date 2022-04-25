Colibri.UI.Split = class extends Colibri.UI.Component {

    static OrientationHorizontal = 'horizontal';
    static OrientationVertical = 'vertical';

    _orientation = Colibri.UI.Split.OrientationHorizontal;

    constructor(name, container, element, orientation) {
        super(name, container, element || '<div />');

        this.AddClass('app-component-split');

        this._left = Element.create('div', {class: 'app-component-split-left'});
        this._handler = Element.create('div', {class: 'app-component-split-handler'});
        this._right = Element.create('div', {class: 'app-component-split-right'});
        this._element.append(this._left);
        this._element.append(this._handler);
        this._element.append(this._right);

        this._hasHandle = true;

        this._orientation = orientation || Colibri.UI.Split.OrientationHorizontal;
        this.AddClass('app-component-split-' + this._orientation);

        
        const startResize = (e) => {
            this._resizing = true;
            Colibri.UI.Resizing = true;
            this._resizeData = this._left.bounds();
            this.AddClass('-resizing');

            // ставим на документ, чтобы точно перехватить        
            document.addEventListener("touchend", stopResize, {capture: true});
            document.addEventListener("mouseup", stopResize, {capture: true});

            document.addEventListener("touchmove", doResize, {capture: true});
            document.addEventListener("mousemove", doResize, {capture: true});

            this.Dispatch('SplitResizeStart');

            return false;

        };

        const stopResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.RemoveClass('-resizing');
        
            this._resizing = false;
            Colibri.UI.Resizing = false;

            document.removeEventListener("touchend", this.__resizeEnd, {capture: true});
            document.removeEventListener("mouseup", this.__resizeEnd, {capture: true});
    
            document.removeEventListener("touchmove", doResize, {capture: true});
            document.removeEventListener("mousemove", doResize, {capture: true});

            this.Dispatch('SplitResizeStop');

            return false;

        };

        const doResize = (e) => {
            if (this._resizing) {
                e.preventDefault();
    
                if(this._orientation == Colibri.UI.Split.OrientationHorizontal) {
                    this._left.css('flex', '0 0 ' + (e.pageX - this._resizeData.left) + 'px');
                }
    
                if(this._orientation == Colibri.UI.Split.OrientationVertical) {
                    this._left.css('flex', '0 0 ' + (e.pageY - this._resizeData.top) + 'px');
                }
    
                this.Dispatch('SplitResizing');

                return false;
            }
        };

        this._handler.addEventListener("touchstart", startResize, false);
        this._handler.addEventListener("mousedown", startResize, false);

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SplitResizeStart', false, 'Когда начинаем изменять размер');
        this.RegisterEvent('SplitResizing', false, 'В процессе изменения размера');
        this.RegisterEvent('SplitResizeStop', false, 'Когда закончили изменять размер');
    }

    get orientation() {
        return this._orientation;
    }
    set orientation(value) {
        this._orientation = value;
        this.AddClass('app-component-split-' + this._orientation);
    }

    get container() {
        if(this.children == 0) {
            return this._element.querySelector('.app-component-split-left');
        }
        else {
            return this._element.querySelector('.app-component-split-right');
        }
    }

    get hasHandle() {
        return this._hasHandle;
    }

    set hasHandle(value) {
        this._hasHandle = value;
        if (value === true || value === 'true') {
            this._handler.style.display = '';
        } else {
            this._handler.style.display = 'none';
        }
    }

    ProcessChildren(children, parent) {

        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            const componentClass = this.CreateComponentClass(element);
            if(componentClass) {
                let component = this.CreateComponent(componentClass, element, this);
                component && component.ProcessChildren(element.childNodes, component.container);
            }
        }

    }

    get rightWidth() {
        return parseInt(this._right.css('width'));
    }

    get leftWidth() {
        return parseInt(this._left.css('width'));
    }

    set leftWidth(value) {
        this._left.css('flex', '0 0 ' + value );
    }

}