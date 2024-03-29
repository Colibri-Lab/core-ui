Colibri.UI.DateDiffViewer = class extends Colibri.UI.Viewer {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-daterangeviewer');

        this._value = null;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if(!Array.isArray(value)) {
            value = [value, (new Date()).toDbDate()];
        }

        this._value = value;
    
        try {
            super.value = value[0].toDate().DiffFullTokens(value[1].toDate());
        } catch(e) {
            super.value = '';
        }

    }
}