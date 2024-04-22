/**
 * Confirmation dialog
 * @class
 * @extends Colibri.UI.Window
 * @memberof Colibri.UI
 */
Colibri.UI.ConfirmDialog = class extends Colibri.UI.Window {

    /**
     * @constructor
     * @param {string} name name of window
     * @param {Element|Colibri.UI.Component} container container component or element
     * @param {number} width width of confirmation window
     */
    constructor(name, container, width) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.ConfirmDialog'], '', width);
        this.AddClass('app-confirm-dialog-component')
        this._callback = null;
    }
    
    /**
     * Shown dialog
     * @param {string} title title of dialog
     * @param {string} message message to show in dialog
     * @param {string} okbutton ok button title
     * @param {string} cancelbutton cancel button title
     * @returns Promise
     */
    Show(title, message, okbutton = null, cancelbutton = null, hideCancelButton = false) {
    
        return new Promise((resolve, reject) => {
            this.title = title;
            this.Children('message').value = message;
            this.Children('btn-save').value = okbutton || '#{ui-confirm-ok}';
            this.Children('btn-cancel').value = cancelbutton || '#{ui-confirm-cancel}';
            this.Children('btn-cancel').shown = !hideCancelButton;
            
            super.Show();

            this.Children('btn-save').ClearHandlers();
            this.Children('btn-save').AddHandler('Clicked', (event, args) => {
                resolve();
                this.Hide();
            });
    
            this.Children('btn-cancel').ClearHandlers();
            this.Children('btn-cancel').AddHandler('Clicked', (event, args) => {
                reject();
                this.Hide();
            });

        });

    }

}