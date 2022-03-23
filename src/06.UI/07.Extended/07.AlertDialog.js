Colibri.UI.AlertDialog = class extends Colibri.UI.Window {

    constructor(name, container, width) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.AlertDialog'], '', width);
        this.AddClass('app-alert-dialog-component')

        this._callback = null;

        this.Children('btn-cancel').AddHandler('Clicked', (event, args) => {
            this._callback && this._callback.apply(this, []);
            this.Hide();
        });


    }

    /**
     * Показывает диалог
     * @param {Function(dialogResult)} callback
     */
    Show(title, message, button, callback) {
        this.title = title;
        this.Children('message').value = message;
        this.Children('btn-cancel').value = button || 'Закрыть';
        this._callback = callback;
        super.Show();
    }

}