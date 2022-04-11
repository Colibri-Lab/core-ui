Colibri.UI.PromptDialog = class extends Colibri.UI.Window {

    constructor(name, container, width) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.PromptDialog'], '', width);
        this.AddClass('app-prompt-dialog-component');

        this._callback = null;

        this.AddHandler('KeyDown', (event, args) => {
            if(args.domEvent.code == 'Enter' || args.domEvent.code == 'NumpadEnter') {
                this._save.Dispatch('Clicked');
                args.domEvent.stopPropagation();
                args.domEvent.preventDefault();
                return false;
            }
            else if(args.domEvent.code == 'Escape') {
                this._cancel.Dispatch('Clicked');
                args.domEvent.stopPropagation();
                args.domEvent.preventDefault();
                return false;
            }
        })


    }

    /**
     * Показывает диалог
     * @param {Function(dialogResult)} callback результат диалога, true - да, false - нет 
     */
    Show(title, fields, button) {
    
    
        return new Promise((resolve, reject) => {
            this.title = title;

            this._form = this.Children('form');
            this._save = this.Children('btn-save');
            this._cancel = this.Children('btn-cancel');
            this._save.enabled = false;

            if(!this._validator) {
                this._validator = new Colibri.UI.FormValidator(this._form);
            }
            this._form.fields = fields;
            this._form.value = {};


            this._save.value = button || 'Продолжить';
            super.Show();

            this._form.Children('firstChild').Focus();

            this._validator.ClearHandlers();
            this._validator.AddHandler('Validated', (event, args) => this._save.enabled = this._validator.Validate());

            this._save.ClearHandlers();
            this._save.AddHandler('Clicked', (event, args) => {
                resolve(this._form.value);
                this.Hide();
            });
    
            this._cancel.ClearHandlers();
            this._cancel.AddHandler('Clicked', (event, args) => {
                reject();
                this.Hide();
            });

        });

    }

}