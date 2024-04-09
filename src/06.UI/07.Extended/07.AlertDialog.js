/**
 * Alert dialog component
 * @class
 * @extends Colibri.UI.Window
 * @memberof Colibri.UI
 */
Colibri.UI.AlertDialog = class extends Colibri.UI.Window {

    /**
     * @constructor
     * @param {string} name Name of component
     * @param {Element|Colibri.UI.Component} container parent container or component
     * @param {number} width width of window
     */
    constructor(name, container, width) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.AlertDialog'], '', width);
        this.AddClass('app-alert-dialog-component')

        this._callback = null;

    }

    /**
     * Shows alert
     * @param {string} title title of window
     * @param {string} message message to show in window
     * @param {string} button button title
     * @returns {Promise}
     */
    Show(title, message, button) {
        return new Promise((resolve, reject) => {
            this.title = title;
            this.Children('message').value = message;
            this.Children('btn-cancel').value = button || '#{ui-alert-close}';
    
            super.Show();

            this.Children('btn-cancel').ClearHandlers();
            this.Children('btn-cancel').AddHandler('Clicked', (event, args) => {
                this.Hide();
            });
        });
    }

}