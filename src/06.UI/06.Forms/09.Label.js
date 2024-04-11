/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Label = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFielContainer() {

        this.AddClass('app-component-label-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('span', {}));

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        if(this._fieldData.params?.className) {
            this.AddClass(this._fieldData.params?.className);
        }

    }

    /**
     * Focus on component
     */
    Focus() {
        // do nothing
    }
    /**
     * Value string
     * @type {string}
     */
    get value() {
        return this._input.html();
    }
    /**
     * Value string
     * @type {string}
     */
    set value(value) {
        this._input.html(value);
    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    get tabIndex() {
        return null;
    }
    /**
     * Tab index
     * @type {number|boolean}
     */
    set tabIndex(value) {
        // do nothing
    }
    
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Label', 'Colibri.UI.Forms.Label', '#{ui-fields-label}')
