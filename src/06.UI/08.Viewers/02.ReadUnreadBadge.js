Colibri.UI.ReadUnreadBadge = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-read-unread-badge-component');

    }

    get value() {
        return this.ContainsClass('app-is-read-component');
    }

    set value(value) {
        if(value) {
            this.AddClass('app-is-read-component');
        }
        else {
            this.RemoveClass('app-is-read-component');
        }
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.ReadUnreadBadge', '#{app-viewers-badge;Отображение Да/Нет}');