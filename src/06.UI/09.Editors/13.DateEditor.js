/**
 * Edits a date-only value using the standard date selector.
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Editor
 */
Colibri.UI.DateEditor = class extends Colibri.UI.Editor {

	/**
	 * Date selector owned by this editor.
	 * @var {Colibri.UI.DateSelector|null}
	 * @private
	 * @ignore
	 */
	_input = null;

	/**
	 * Whether a value is being assigned programmatically.
	 * @var {Boolean}
	 * @private
	 * @ignore
	 */
	_settingValue = false;

	/**
	 * Read-only state of the editor.
	 * @var {Boolean}
	 * @private
	 * @ignore
	 */
	_readonly = false;

	/**
	 * Requested enabled state.
	 * @var {Boolean}
	 * @private
	 * @ignore
	 */
	_enabled = true;

	/**
	 * Creates a date editor.
	 * @constructor
	 * @public
	 * @param {String} name Component name.
	 * @param {Element|Colibri.UI.Component} container Parent container.
	 */
	constructor(name, container) {
		super(name, container, Element.create('div'));
		this.AddClass('app-date-editor-component');
	}

	/**
	 * Field metadata used to configure the selector.
	 * @type {Object}
	 * @public
	 */
	get field() {
		return super.field;
	}
	/**
	 * Field metadata used to configure the selector.
	 * @type {Object}
	 * @public
	 */
	set field(value) {
		super.field = value;
		this._showField();
	}

	/**
	 * Creates and configures the inner date selector.
	 * @returns {void}
	 * @protected
	 * @ignore
	 */
	_showField() {
		if (!this._input) {
			this._input = this._createSelector();
			this._input.shown = true;
			this._input.AddHandler('Changed', this.__inputChanged, false, this);
			this._input.AddHandler('Cleared', this.__inputChanged, false, this);
			this._input.AddHandler('ReceiveFocus', this.__thisBubble, false, this);
			this._input.AddHandler('LoosedFocus', this.__thisBubble, false, this);
			this._input.AddHandler('KeyDown', this.__thisBubble, false, this);
			this._input.AddHandler('KeyUp', this.__thisBubble, false, this);
		}
		this.readonly = this.field?.params?.readonly ?? false;
		this.enabled = this.field?.params?.enabled ?? true;
		this.placeholder = this.field?.placeholder ?? '';
		this._input.clearIcon = this.field?.params?.dateselectorclear ?? true;
	}

	/**
	 * Creates the date selector used by the editor.
	 * @returns {Colibri.UI.DateSelector} Inner selector.
	 * @protected
	 * @ignore
	 */
	_createSelector() {
		return new Colibri.UI.DateSelector('input', this);
	}

	/**
	 * Relays user date changes without emitting changes during data loading.
	 * @param {Colibri.Events.Event} event Selector event.
	 * @param {Object} args Event arguments.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	__inputChanged(event, args) {
		if (this._settingValue || this._readonly || !this._enabled) {
			return;
		}
		this.Validate();
		this.Dispatch('Changed', Object.assign({}, args, { component: this }));
	}

	/**
	 * Date-only value, or null when the selection is empty.
	 * @type {String|null}
	 * @public
	 */
	get value() {
		const date = this._input?.value;
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			return null;
		}
		return date.toShortDateString();
	}
	/**
	 * Date-only value; accepts a date string, Date, or null.
	 * @type {String|Date|null}
	 * @public
	 */
	set value(value) {
		this._showField();
		this._settingValue = true;
		try {
			this._input.value = value || null;
			this.Validate();
		} finally {
			this._settingValue = false;
		}
	}

	/**
	 * Read-only state.
	 * @type {Boolean}
	 * @public
	 */
	get readonly() {
		return this._readonly;
	}
	/**
	 * Read-only state.
	 * @type {Boolean}
	 * @public
	 */
	set readonly(value) {
		this._readonly = this._convertProperty('Boolean', value);
		this._input.readonly = this._readonly;
		this._input.enabled = this._enabled && !this._readonly;
	}

	/**
	 * Enabled state.
	 * @type {Boolean}
	 * @public
	 */
	get enabled() {
		return this._enabled;
	}
	/**
	 * Enabled state.
	 * @type {Boolean}
	 * @public
	 */
	set enabled(value) {
		this._enabled = this._convertProperty('Boolean', value);
		this._input.enabled = this._enabled && !this._readonly;
		this.ToggleClass('ui-disabled', !this._enabled);
	}

	/**
	 * Placeholder shown for an empty date.
	 * @type {String}
	 * @public
	 */
	get placeholder() {
		return this._input.placeholder;
	}
	/**
	 * Placeholder shown for an empty date.
	 * @type {String}
	 * @public
	 */
	set placeholder(value) {
		this._input.placeholder = this._convertProperty('String', value);
	}

	/**
	 * Updates the filled state after date validation.
	 * @returns {void}
	 * @public
	 */
	Validate() {
		if (this.value) {
			this._setFilled();
		} else {
			this._unsetFilled();
		}
	}

	/**
	 * Focuses the date selector.
	 * @returns {void}
	 * @public
	 */
	Focus() {
		this._input?.Focus();
	}
};
Colibri.UI.Editor.Register('Colibri.UI.DateEditor', '#{ui-editors-date}');