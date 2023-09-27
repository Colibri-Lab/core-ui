Colibri.UI.Forms.Passport = class extends Colibri.UI.Forms.Field {

	RenderFieldContainer() {

		this.AddClass('app-component-passport-field');

		const contentContainer = this.contentContainer;

		this._div1 = new Colibri.UI.Pane('div1', contentContainer);
		this._div1.shown = true;

		this._div2 = new Colibri.UI.Pane('div2', contentContainer);
		this._div2.shown = true;

		this._input1 = this._div1.container.append(Element.create('input', { type: 'text', name: this._name + '-input1' }));

		this._text = new Colibri.UI.TextSpan(this._name + '-text', this._div2);
		this._text.shown = true;
		this._text.value = '№';

		this._input2 = this._div2.container.append(Element.create('input', { type: 'number', name: this._name + '-input2' }));

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
		this.placeholder = this._fieldData?.placeholder;

        const mask = this._fieldData?.params?.mask;
        if(mask) {
            
			if(Array.isArray(mask)) {
				this._masker1 = new Colibri.UI.Utilities.Mask([this._input1]);
				this._masker1.maskPattern(mask[0]);
	
				this._masker2 = new Colibri.UI.Utilities.Mask([this._input2]);
				this._masker2.maskPattern(mask[1]);	
			}
			else if(Object.isObject(mask)) {
				this._masker1 = new Colibri.UI.Utilities.Mask([this._input1]);
				this._masker1.maskPattern(mask.series);
	
				this._masker2 = new Colibri.UI.Utilities.Mask([this._input2]);
				this._masker2.maskPattern(mask.number);	
			}
			else {
				const m = mask.split(' | ');
				this._masker1 = new Colibri.UI.Utilities.Mask([this._input1]);
				this._masker1.maskPattern(m[0]);
	
				this._masker2 = new Colibri.UI.Utilities.Mask([this._input2]);
				this._masker2.maskPattern(m[1]);	
			}

        } 

		this._input1.addEventListener('change', (e) => this.Dispatch('Changed', { domEvent: e, component: this }));
		this._input2.addEventListener('change', (e) => this.Dispatch('Changed', { domEvent: e, component: this }));

		this._input1.addEventListener('click', (e) => this.Dispatch('Clicked', { domEvent: e }));
		this._input2.addEventListener('click', (e) => this.Dispatch('Clicked', { domEvent: e }));

	}

	get title() {
		return this.Children(this._name + '-title').value;
	}
	set title(value) {
        value = this._convertProperty('String', value);
		this.Children(this._name + '-title').value = value;
	}

	get readonly() {
		return this._input1.attr('readonly') === 'readonly';
	}

	set readonly(value) {
        value = this._convertProperty('Boolean', value);
		if (value) {
			this._input1.attr('readonly', 'readonly');
			this._input2.attr('readonly', 'readonly');
		}
		else {
			this._input1.attr('readonly', null);
			this._input2.attr('readonly', null);
		}
	}

	get placeholder() {
		return this._input1.attr('placeholder') + ' | ' + this._input2.attr('placeholder');
	}

	set placeholder(value) {
		if(Array.isArray(value)) {
			this._input1.attr('placeholder', value[0][Lang.Current] ?? value[0]);
			this._input2.attr('placeholder', value[1][Lang.Current] ?? value[1]);
		}
		else if(Object.isObject(value)) {
			this._input1.attr('placeholder', value.series[Lang.Current] ?? value.series);
			this._input2.attr('placeholder', value.number[Lang.Current] ?? value.number);
		}
		else {
			const place = value ? (value[Lang.Current] ?? value).split(' | ') : ['', ''];
			this._input1.attr('placeholder', place[0]);
			this._input2.attr('placeholder', place[1]);
		}
	}

	get value() {
		return [
			this._input1.value, 
			this._input2.value
		];
	}

	set value(value) {
		this._input1.value = value[0];
		this._input2.value = value[0];
	}

	get enabled() {
		return this._input1.attr('disabled') != 'disabled';
	}

	set enabled(value) {
        value = this._convertProperty('Boolean', value);
		if (value) {
			this.RemoveClass('app-component-disabled');
			this._input1.attr('disabled', null);
			this._input2.attr('disabled', null);
		}
		else {
			this.AddClass('app-component-disabled');
			this._input1.attr('disabled', 'disabled');
			this._input2.attr('disabled', 'disabled');
		}
	}

	/**
	 * Индекс табуляции
	 * @todo проверить правильно ли получаю tabIndex и исправить
	 * @type {number}
	 */
	get tabIndex() {
		return this._input1.attr('tabIndex');
	}
	set tabIndex(value) {
		this._input1.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
		this._input2.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value + 1);
	}

	set width(value) {
		this._div1.width = value[0];
		this._div2.width = value[0];
	}
	get width() {
		return [
			this._div1.width,
			this._div2.width
		];
	}
	

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Passport', 'Colibri.UI.Forms.Passport', '#{ui-fields-passport}')


