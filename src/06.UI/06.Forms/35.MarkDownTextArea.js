/**
 * Chat-style Markdown form field.
 * @class
 * @memberof Colibri.UI.Forms
 * @extends Colibri.UI.Forms.Field
 */
Colibri.UI.Forms.MarkDownTextArea = class extends Colibri.UI.Forms.Field {
	/**
	 * Creates the Markdown input container.
	 * @returns {void}
	 * @protected
	 * @ignore
	 */
	RenderFieldContainer() {
		this.AddClass('app-component-markdowntextarea-field');
		/**
		 * Composer surface.
		 * @var {Colibri.UI.FlexBox}
		 * @private
		 * @ignore
		 */
		this._surface = new Colibri.UI.FlexBox('composer', this.contentContainer);
		this._surface.AddClass('markdown-composer');
		this._surface.direction = 'column';
		this._surface.shown = true;
		/**
		 * Native Markdown input.
		 * @var {HTMLTextAreaElement}
		 * @private
		 * @ignore
		 */
		this._input = this._surface.container.append(Element.create('textarea', {name: this.name + '-input', spellcheck: 'true'}));
		/**
		 * Rendered Markdown preview.
		 * @var {Colibri.UI.Pane}
		 * @private
		 * @ignore
		 */
		this._previewPane = new Colibri.UI.Pane('preview', this._surface);
		this._previewPane.AddClass('markdown-preview');
		/**
		 * Composer command row.
		 * @var {Colibri.UI.FlexBox}
		 * @private
		 * @ignore
		 */
		this._footer = new Colibri.UI.FlexBox('footer', this._surface);
		this._footer.AddClass('markdown-footer');
		this._footer.shown = true;
		/**
		 * Formatting tools.
		 * @var {Colibri.UI.FlexBox}
		 * @private
		 * @ignore
		 */
		this._tools = new Colibri.UI.FlexBox('tools', this._footer);
		this._tools.AddClass('markdown-tools');
		this._tools.shown = true;
		/**
		 * Formatting buttons indexed by command.
		 * @var {Object<string, Colibri.UI.SimpleButton>}
		 * @private
		 * @ignore
		 */
		this._formatButtons = {};
		for (const command of ['bold', 'italic', 'code', 'list', 'link', 'quote']) {
			const button = new Colibri.UI.SimpleButton(command, this._tools);
			button.AddClass('markdown-tool markdown-tool-' + command);
			button.toolTip = this._commandTitle(command);
			button._element.setAttribute('aria-label', button.toolTip);
			button.shown = true;
			if (command === 'list') {
				button.icon = 'Colibri.UI.ListIcon';
			} else if (command === 'link') {
				button.icon = 'Colibri.UI.ContextMenuOpenLinkIcon';
			} else {
				button.value = {bold: 'B', italic: 'I', code: '&lt;/&gt;', quote: '&gt;'}[command];
			}
			button.AddHandler('Clicked', this.__formatClicked, false, this);
			this._formatButtons[command] = button;
		}
		/**
		 * Native editor and preview mode selector.
		 * @var {Colibri.UI.ButtonGroup}
		 * @private
		 * @ignore
		 */
		this._modes = new Colibri.UI.ButtonGroup('modes', this._footer);
		this._modes.AddClass('markdown-modes');
		this._modes.shown = true;
		/**
		 * Edit mode button.
		 * @var {Colibri.UI.SimpleButton}
		 * @private
		 * @ignore
		 */
		this._editButton = new Colibri.UI.SimpleButton('edit', this._modes);
		this._editButton.icon = 'Colibri.UI.EditIcon';
		this._editButton.toolTip = '#{ui-forms-markdowntextarea-edit}';
		this._editButton._element.setAttribute('aria-label', this._editButton.toolTip);
		this._editButton.shown = true;
		/**
		 * Preview mode button.
		 * @var {Colibri.UI.SimpleButton}
		 * @private
		 * @ignore
		 */
		this._previewButton = new Colibri.UI.SimpleButton('preview', this._modes);
		this._previewButton.icon = 'Colibri.UI.EyeIcon';
		this._previewButton.toolTip = '#{ui-forms-markdowntextarea-preview}';
		this._previewButton._element.setAttribute('aria-label', this._previewButton.toolTip);
		this._previewButton.shown = true;
		/**
		 * Optional submit action.
		 * @var {Colibri.UI.SimpleButton}
		 * @private
		 * @ignore
		 */
		this._sendButton = new Colibri.UI.SimpleButton('send', this._footer);
		this._sendButton.AddClass('markdown-send');
		this._sendButton.icon = 'Colibri.UI.SendMessageIcon';
		this._sendButton.toolTip = '#{ui-forms-markdowntextarea-send}';
		this._sendButton._element.setAttribute('aria-label', this._sendButton.toolTip);
		this._sendButton.AddHandler('Clicked', this.__sendClicked, false, this);
		/**
		 * Current preview mode.
		 * @var {Boolean}
		 * @private
		 * @ignore
		 */
		this._preview = false;
		/**
		 * Last committed input value.
		 * @var {String}
		 * @private
		 * @ignore
		 */
		this._original = '';
		/**
		 * Whether submission is available in this field.
		 * @var {Boolean}
		 * @private
		 * @ignore
		 */
		this._submitVisible = this._convertProperty('Boolean', this._fieldData?.params?.submit ?? false);
		this._modes.AddHandler('Changed', this.__modeChanged, false, this);
		this._modes.selectedIndex = 0;
		this._tools._element.addEventListener('mousedown', event => event.preventDefault());
		this._input.addEventListener('input', event => this.__inputChanged(event));
		this._input.addEventListener('keydown', event => this.__inputKeyDown(event));
		this._input.addEventListener('focus', event => {
			this._resizeInput();
			this.Dispatch('ReceiveFocus', {domEvent: event});
		});
		this._input.addEventListener('blur', event => this.Dispatch('LoosedFocus', {domEvent: event}));
		this._input.addEventListener('click', event => event.stopPropagation());
		if (Number(this._fieldData?.params?.maxlength) > 0) this._input.maxLength = Number(this._fieldData.params.maxlength);
		this.value = this._fieldData?.default ?? '';
		this.readonly = this._fieldData?.params?.readonly ?? false;
		this.enabled = this._fieldData?.params?.enabled ?? true;
		this._showPreview();
	}

	/**
	 * Registers field-specific events.
	 * @returns {void}
	 * @protected
	 * @ignore
	 */
	_registerEvents() {
		super._registerEvents();
		this.RegisterEvent('SubmitRequested', false, 'Markdown submission requested');
	}

	/**
	 * Markdown source stored by the form.
	 * @type {String|null}
	 * @public
	 */
	get value() {
		const value = this._input?.value ?? '';
		return this._fieldData?.params?.emptyAsNull && !value ? null : value;
	}

	/**
	 * Markdown source stored by the form.
	 * @type {String|null}
	 * @public
	 */
	set value(value) {
		this._input.value = this._convertProperty('String', value ?? '');
		this._original = this._input.value;
		this._showValue();
	}

	/**
	 * Whether the source is read-only.
	 * @type {Boolean}
	 * @public
	 */
	get readonly() { return this._input.readOnly; }

	/**
	 * Whether the source is read-only.
	 * @type {Boolean}
	 * @public
	 */
	set readonly(value) {
		this._input.readOnly = this._convertProperty('Boolean', value);
		this._showState();
	}

	/**
	 * Whether the field accepts user interaction.
	 * @type {Boolean}
	 * @public
	 */
	get enabled() { return !this._input.disabled; }

	/**
	 * Whether the field accepts user interaction.
	 * @type {Boolean}
	 * @public
	 */
	set enabled(value) {
		this._input.disabled = !this._convertProperty('Boolean', value);
		if (this._input.disabled) {
			this.AddClass('app-component-disabled');
		} else {
			this.RemoveClass('app-component-disabled');
		}
		this._showState();
	}

	/**
	 * Input placeholder.
	 * @type {String}
	 * @public
	 */
	get placeholder() { return this._input.placeholder; }

	/**
	 * Input placeholder.
	 * @type {String}
	 * @public
	 */
	set placeholder(value) {
		this._input.placeholder = this._convertProperty('String', value ?? '');
	}

	/**
	 * Whether the rendered preview is selected.
	 * @type {Boolean}
	 * @public
	 */
	get preview() { return this._preview; }

	/**
	 * Whether the rendered preview is selected.
	 * @type {Boolean}
	 * @public
	 */
	set preview(value) {
		value = this._convertProperty('Boolean', value);
		if (this._preview === value) return;
		this._preview = value;
		this._showPreview();
	}

	/**
	 * Focuses the editable source.
	 * @returns {void}
	 * @public
	 */
	Focus() {
		this.preview = false;
		this._input.focus();
	}

	/**
	 * Applies a Markdown command to the current selection.
	 * @param {String} command Formatting command.
	 * @returns {void}
	 * @public
	 */
	Format(command) {
		if (!this.enabled || this.readonly || this.preview) return;
		const original = this._input.value;
		const result = Colibri.UI.Forms.MarkDownTextArea.FormatSelection(original, this._input.selectionStart, this._input.selectionEnd, command);
		this._input.value = result.value;
		this._input.focus();
		this._input.setSelectionRange(result.start, result.end);
		this._notifyChanged(original);
	}

	/**
	 * Requests submission without sending or clearing the source itself.
	 * @returns {void}
	 * @public
	 */
	Submit() {
		if (this._submitVisible && this.enabled && !this.readonly && String(this.value || '').trim()) {
			this.Dispatch('SubmitRequested', {value: this.value});
		}
	}

	/**
	 * Updates source height, preview and command availability.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	_showValue() {
		this._resizeInput();
		if (this._preview && this._previewPane) {
			this._previewPane.value = Colibri.UI.Forms.MarkDownTextArea.RenderMarkdown(this.value || '');
		}
		this._showState();
	}

	/**
	 * Resizes source input within the configured bounds.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	_resizeInput() {
		const minimum = Math.max(48, Number(this._fieldData?.params?.minHeight) || 96);
		const maximum = Math.max(minimum, Number(this._fieldData?.params?.maxHeight) || 320);
		this._input.style.height = 'auto';
		this._input.style.height = Math.min(maximum, Math.max(minimum, this._input.scrollHeight)) + 'px';
		this._input.style.overflowY = this._input.scrollHeight > maximum ? 'auto' : 'hidden';
	}

	/**
	 * Displays one native mode without replacing the input.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	_showPreview() {
		this._input.style.display = this._preview ? 'none' : '';
		this._previewPane.shown = this._preview;
		this._tools.shown = !this._preview;
		const index = this._preview ? 1 : 0;
		if (this._modes.selectedIndex !== index) this._modes.selectedIndex = index;
		this._showValue();
	}

	/**
	 * Enables tools only when the source can be changed.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	_showState() {
		if (!this._formatButtons) return;
		for (const button of Object.values(this._formatButtons)) {
			button.enabled = this.enabled && !this.readonly && !this._preview;
		}
		this._editButton.enabled = this.enabled;
		this._previewButton.enabled = this.enabled;
		this._sendButton.shown = this._submitVisible;
		this._sendButton.enabled = this.enabled && !this.readonly && Boolean(String(this.value || '').trim());
	}

	/**
	 * Dispatches one form change for an actual source change.
	 * @param {String} original Previous source.
	 * @param {Event|null} domEvent Native input event.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	_notifyChanged(original, domEvent = null) {
		this._showValue();
		this._original = this._input.value;
		if (original !== this._input.value) this.Dispatch('Changed', {component: this, original, domEvent});
	}

	/**
	 * Returns the localized formatting command title.
	 * @param {String} command Command name.
	 * @returns {String} Localized tooltip.
	 * @private
	 * @ignore
	 */
	_commandTitle(command) {
		return {
			bold: '#{ui-forms-markdowntextarea-bold}', italic: '#{ui-forms-markdowntextarea-italic}',
			code: '#{ui-forms-markdowntextarea-code}', list: '#{ui-forms-markdowntextarea-list}',
			link: '#{ui-forms-markdowntextarea-link}', quote: '#{ui-forms-markdowntextarea-quote}'
		}[command];
	}

	/**
	 * Processes native source edits immediately.
	 * @param {Event} event Input event.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	__inputChanged(event) { this._notifyChanged(this._original, event); }

	/**
	 * Handles formatting and submit shortcuts without stealing normal Enter.
	 * @param {KeyboardEvent} event Keyboard event.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	__inputKeyDown(event) {
		event.stopPropagation();
		if (event.isComposing || !(event.ctrlKey || event.metaKey)) return;
		const key = event.key.toLowerCase();
		if (key === 'enter' && this._submitVisible) {
			event.preventDefault();
			this.Submit();
		} else if (['b', 'i', 'k'].includes(key)) {
			event.preventDefault();
			this.Format({b: 'bold', i: 'italic', k: 'link'}[key]);
		}
	}

	/**
	 * Applies a clicked formatting command.
	 * @param {Colibri.Events.Event} event Component event.
	 * @param {Object} args Event arguments.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	__formatClicked(event, args) { this.Format(event.sender.name); }

	/**
	 * Selects editor or preview through ButtonGroup.
	 * @param {Colibri.Events.Event} event Mode event.
	 * @param {Object} args Selected mode.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	__modeChanged(event, args) { this.preview = args.value === 'preview'; }

	/**
	 * Relays the submit button command.
	 * @param {Colibri.Events.Event} event Button event.
	 * @param {Object} args Event arguments.
	 * @returns {void}
	 * @private
	 * @ignore
	 */
	__sendClicked(event, args) { this.Submit(); }

	/**
	 * Builds source edits without touching the DOM.
	 * @param {String} value Markdown source.
	 * @param {Number} start Selection start.
	 * @param {Number} end Selection end.
	 * @param {String} command Formatting command.
	 * @returns {Object} Updated source and selection.
	 * @public
	 * @static
	 */
	static FormatSelection(value, start, end, command) {
		value = String(value);
		const selected = value.slice(start, end);
		if (command === 'list' || command === 'quote') {
			const lineStart = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
			const lineEnd = value.indexOf('\n', end);
			const stop = lineEnd === -1 ? value.length : lineEnd;
			const prefix = command === 'list' ? '- ' : '> ';
			const replacement = value.slice(lineStart, stop).split('\n').map(line => prefix + line).join('\n');
			return {value: value.slice(0, lineStart) + replacement + value.slice(stop), start: lineStart + prefix.length, end: lineStart + replacement.length};
		}
		const markers = {bold: ['**', '**'], italic: ['*', '*'], code: ['`', '`'], link: ['[', '](https://)']};
		const marker = markers[command];
		if (!marker) return {value, start, end};
		const replacement = marker[0] + selected + marker[1];
		const result = {value: value.slice(0, start) + replacement + value.slice(end), start: start + marker[0].length, end: end + marker[0].length};
		if (command === 'link') {
			result.start = start + selected.length + 3;
			result.end = result.start + 8;
		}
		return result;
	}

	/**
	 * Converts the supported Markdown subset into HTML without accepting raw HTML.
	 * @param {String} source Markdown source.
	 * @param {Number} depth Current block quote nesting depth.
	 * @returns {String} Safe rendered HTML.
	 * @public
	 * @static
	 */
	static RenderMarkdown(source, depth = 0) {
		const editor = Colibri.UI.Forms.MarkDownTextArea;
		if (depth > 8) return editor._escapeHtml(source);
		const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
		const output = [];
		let index = 0;
		while (index < lines.length) {
			const line = lines[index];
			if (!line.trim()) { index++; continue; }
			const fence = line.match(/^\s*(`{3,}|~{3,})\s*([a-zA-Z0-9_+-]*)\s*$/);
			if (fence) {
				const code = [];
				index++;
				while (index < lines.length && !new RegExp('^\\s*' + fence[1][0] + '{' + fence[1].length + ',}\\s*$').test(lines[index])) code.push(lines[index++]);
				if (index < lines.length) index++;
				output.push('<pre><code' + (fence[2] ? ' class="language-' + fence[2] + '"' : '') + '>' + editor._escapeHtml(code.join('\n')) + '</code></pre>');
				continue;
			}
			const heading = line.match(/^(#{1,6})\s+(.+)$/);
			if (heading) {
				const level = heading[1].length;
				output.push('<h' + level + '>' + editor._renderInline(heading[2]) + '</h' + level + '>');
				index++; continue;
			}
			if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { output.push('<hr>'); index++; continue; }
			if (/^\s*>/.test(line)) {
				const quote = [];
				while (index < lines.length && /^\s*>/.test(lines[index])) quote.push(lines[index++].replace(/^\s*> ?/, ''));
				output.push('<blockquote>' + editor.RenderMarkdown(quote.join('\n'), depth + 1) + '</blockquote>');
				continue;
			}
			const list = line.match(/^\s*(?:([-+*])|(\d+)\.)\s+(.+)$/);
			if (list) {
				const ordered = Boolean(list[2]);
				const items = [];
				while (index < lines.length) {
					const item = lines[index].match(/^\s*(?:([-+*])|(\d+)\.)\s+(.+)$/);
					if (!item || Boolean(item[2]) !== ordered) break;
					items.push('<li>' + editor._renderInline(item[3]) + '</li>');
					index++;
				}
				const tag = ordered ? 'ol' : 'ul';
				output.push('<' + tag + '>' + items.join('') + '</' + tag + '>');
				continue;
			}
			const paragraph = [line];
			index++;
			while (index < lines.length && lines[index].trim() && !/^\s*(?:#{1,6}\s|>|`{3,}|~{3,}|[-+*]\s|\d+\.\s|---+$)/.test(lines[index])) paragraph.push(lines[index++]);
			output.push('<p>' + paragraph.map(text => editor._renderInline(text)).join('<br>') + '</p>');
		}
		return output.join('\n');
	}

	/**
	 * Encodes text and attribute values before constructing preview HTML.
	 * @param {String} value Untrusted text.
	 * @returns {String} Encoded HTML text.
	 * @private
	 * @ignore
	 * @static
	 */
	static _escapeHtml(value) {
		return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
	}

	/**
	 * Validates link protocols using the native URL parser.
	 * @param {String} value Link destination.
	 * @returns {Boolean} Whether the link is safe to render.
	 * @private
	 * @ignore
	 * @static
	 */
	static _safeLink(value) {
		if (/[\u0000-\u0020\u007f]/.test(value)) return false;
		try {
			return ['https:', 'http:', 'mailto:'].includes(new URL(value, 'https://markdown.invalid/').protocol);
		} catch {
			return false;
		}
	}

	/**
	 * Renders escaped inline code, emphasis and validated links.
	 * @param {String} source Inline source.
	 * @param {Number} depth Inline nesting depth.
	 * @returns {String} Safe inline HTML.
	 * @private
	 * @ignore
	 * @static
	 */
	static _renderInline(source, depth = 0) {
		const editor = Colibri.UI.Forms.MarkDownTextArea;
		if (depth > 8) return editor._escapeHtml(source);
		let output = '';
		let index = 0;
		while (index < source.length) {
			if (source[index] === '\\' && index + 1 < source.length) {
				output += editor._escapeHtml(source[index + 1]); index += 2; continue;
			}
			if (source[index] === '`') {
				const marker = source.slice(index).match(/^`+/)[0];
				const close = source.indexOf(marker, index + marker.length);
				if (close !== -1) {
					output += '<code>' + editor._escapeHtml(source.slice(index + marker.length, close)) + '</code>';
					index = close + marker.length; continue;
				}
				output += editor._escapeHtml(marker);
				index += marker.length; continue;
			}
			if (source[index] === '[') {
				const middle = source.indexOf('](', index + 1);
				const close = middle === -1 ? -1 : source.indexOf(')', middle + 2);
				if (close !== -1) {
					const destination = source.slice(middle + 2, close).trim();
					if (editor._safeLink(destination)) {
						output += '<a href="' + editor._escapeHtml(destination) + '" rel="noopener noreferrer">' + editor._renderInline(source.slice(index + 1, middle), depth + 1) + '</a>';
						index = close + 1; continue;
					}
				}
			}
			let formatted = false;
			for (const [marker, opening, closing] of [['***', '<strong><em>', '</em></strong>'], ['**', '<strong>', '</strong>'], ['~~', '<s>', '</s>'], ['*', '<em>', '</em>'], ['_', '<em>', '</em>']]) {
				if (!source.startsWith(marker, index) || (marker === '_' && /[\w]/.test(source[index - 1] || ''))) continue;
				const close = source.indexOf(marker, index + marker.length);
				if (close > index + marker.length) {
					output += opening + editor._renderInline(source.slice(index + marker.length, close), depth + 1) + closing;
					index = close + marker.length;
					formatted = true; break;
				}
			}
			if (!formatted) output += editor._escapeHtml(source[index++]);
		}
		return output;
	}
};

Colibri.UI.Forms.Field.RegisterFieldComponent('MarkDownTextArea', 'Colibri.UI.Forms.MarkDownTextArea', '#{ui-forms-markdowntextarea-title}', null, ['required', 'enabled', 'readonly', 'emptyAsNull', 'maxlength', 'minHeight', 'maxHeight', 'submit', 'validate']);