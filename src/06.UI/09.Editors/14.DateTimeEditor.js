/**
 * Edits a date and time using the standard date-time selector.
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.DateEditor
 */
Colibri.UI.DateTimeEditor = class extends Colibri.UI.DateEditor {

	/**
	 * Creates a date-time editor.
	 * @constructor
	 * @public
	 * @param {String} name Component name.
	 * @param {Element|Colibri.UI.Component} container Parent container.
	 */
	constructor(name, container) {
		super(name, container);
		this.AddClass('app-datetime-editor-component');
	}

	/**
	 * Creates and formats the date-time selector.
	 * @returns {Colibri.UI.DateTimeSelector} Inner selector.
	 * @protected
	 * @ignore
	 */
	_createSelector() {
		const selector = new Colibri.UI.DateTimeSelector('input', this);
		selector.format = new Intl.DateTimeFormat(App.DateFormat || 'ru-RU', {
			day: '2-digit', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit', second: '2-digit'
		});
		return selector;
	}

	/**
	 * Local date-time string, or null when the selection is empty.
	 * @type {String|null}
	 * @public
	 */
	get value() {
		const date = this._input?.value;
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			return null;
		}
		return date.toLocalDateTimeString();
	}
	/**
	 * Date-time value; accepts a date-time string, Date, or null.
	 * @type {String|Date|null}
	 * @public
	 */
	set value(value) {
		super.value = value;
	}
};
Colibri.UI.Editor.Register('Colibri.UI.DateTimeEditor', '#{ui-editors-datetime}');