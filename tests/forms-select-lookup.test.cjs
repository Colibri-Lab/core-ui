const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

class Control {
    constructor(name) {
        this.name = name;
        this.classes = new Set();
    }
    AddClass(value) { this.classes.add(value); }
    RemoveClass(value) { this.classes.delete(value); }
    AddHandler() {}
    Dispatch() {}
}

class FormField extends Control {
    constructor(name, fieldData) {
        super(name);
        this._fieldData = fieldData;
        this.contentContainer = new Control('content');
        this.RenderFieldContainer();
    }
    _registerEvents() {}
    RegisterEvent() {}
    _convertProperty(type, value) {
        if (type === 'Boolean') return value === true || value === 'true';
        return value;
    }
    static RegisterFieldParam() {}
    static RegisterFieldComponent() {}
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

class FakeSelector extends Control {
    constructor(name, container, multiple) {
        super(name);
        this.multiple = multiple;
        this._input = {value: ''};
        this._values = [];
        this._selected = null;
    }
    _findValue(value) {
        return this._values.find((v) => v.value == value) ?? null;
    }
    _renderValue(renderValue = true) {
        if (renderValue) {
            this._input.value = this._findValue(this._selected?.value)?.title ?? '';
        }
    }
    get value() { return this._selected; }
    set value(value) {
        this._selected = value === null ? null : (isObject(value) ? value : (this._findValue(value) ?? {value}));
        this._renderValue();
    }
    get values() { return this._values; }
    set values(value) {
        this._values = value;
        this._renderValue(false);
    }
}

const lookupCalls = [];
const roles = [{value: 'administrator', title: 'Administrator'}, {value: 'editor', title: 'Editor'}];
const UI = {
    Forms: {Field: FormField},
    Selector: FakeSelector,
    GetLookupPromise(component, lookup, term, depends, selected) {
        lookupCalls.push({term, selected});
        return Promise.resolve({result: roles.filter((r) => !term || r.title.includes(term))});
    }
};
const context = vm.createContext({Colibri: {UI}, Lang: {Translate: (v) => v}, isIterable: Array.isArray, console});
context.Object = Object;
Object.isObject = isObject;
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/06.UI/06.Forms/08.Select.js'), 'utf8'), context);
const Select = context.Colibri.UI.Forms.Select;

const fieldData = () => ({
    selector: {value: 'value', title: 'title', ondemand: true},
    lookup: {controller: {module: 'Auth', class: 'Backend', method: 'Roles'}},
    params: {required: true, searchable: true}
});
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('setting an unresolved on-demand value loads the list with the selected value and shows its title', async () => {
    lookupCalls.length = 0;
    const field = new Select('role', fieldData());
    assert.equal(lookupCalls.length, 0);

    field.value = 'administrator';
    await flush();

    assert.deepEqual(lookupCalls, [{term: '', selected: 'administrator'}]);
    assert.equal(field._input._input.value, 'Administrator');
    assert.equal(field.value, 'administrator');

    field.value = 'editor';
    await flush();
    assert.equal(lookupCalls.length, 1);
    assert.equal(field._input._input.value, 'Editor');
});

test('opening the popup ignores the displayed title, typing filters by the entered text', async () => {
    const field = new Select('role', fieldData());
    field.value = 'administrator';
    await flush();
    lookupCalls.length = 0;

    await field._input.__BeforeFilled(false);
    assert.equal(lookupCalls[0].term, '');
    assert.equal(field._input._input.value, 'Administrator');

    field._input._input.value = 'Edi';
    await field._input.__BeforeFilled(true);
    assert.equal(lookupCalls[1].term, 'Edi');
    assert.equal(field._input._input.value, 'Edi');
});
