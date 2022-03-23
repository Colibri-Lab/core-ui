Colibri.UI.ConfirmDialog = class extends Colibri.UI.Window {

    constructor(name, container, width) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.ConfirmDialog'], '', width);
        this.AddClass('app-confirm-dialog-component')

        this._callback = null;

        this.Children('btn-save').AddHandler('Clicked', (event, args) => {
            this._callback && this._callback.apply(this, [true]);
            this.Hide();
        });

        this.Children('btn-cancel').AddHandler('Clicked', (event, args) => {
            this._callback && this._callback.apply(this, [false]);
            this.Hide();
        });


    }

    /**
     * Показывает диалог
     * @param {Function(dialogResult)} callback результат диалога, true - да, false - нет 
     */
    Show(title, message, button, callback) {
        this.title = title;
        this.Children('message').value = message;
        this.Children('btn-save').value = button || 'Продолжить';
        this._callback = callback;
        super.Show();
    }

}