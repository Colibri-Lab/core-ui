const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

class Control {
    constructor(name) {
        this.name = name;
        this.handlers = {};
        this.classes = new Set();
        this._element = {setAttribute() {}, addEventListener() {}};
        this.container = {append: element => element};
    }
    AddClass(value) { this.classes.add(value); }
    RemoveClass(value) { this.classes.delete(value); }
    ToggleClass(value) { this.classes.has(value) ? this.classes.delete(value) : this.classes.add(value); }
    AddHandler(name, handler, bubble, respondent) { this.handlers[name] = {handler, respondent}; }
    Dispatch(name, args) {
        const entry = this.handlers[name];
        if (entry) entry.handler.call(entry.respondent || this, {sender: this}, args);
    }
}

class FormField extends Control {
    constructor(name, fieldData) {
        super(name);
        this._fieldData = fieldData;
        this.contentContainer = new Control('content');
        this._registerEvents();
        this.RenderFieldContainer();
    }
    _registerEvents() {}
    RegisterEvent() {}
    _convertProperty(type, value) {
        if (type === 'Boolean') return value === true || value === 'true';
        if (type === 'Number') return Number(value);
        return value;
    }
    static RegisterFieldComponent() {}
}

const context = vm.createContext({
    URL,
    Colibri: {UI: {Forms: {Field: FormField, TextArea: class {}}, FlexBox: Control, Pane: Control, ButtonGroup: Control, SimpleButton: Control}},
    Element: {create: () => ({
        value: '', disabled: false, readOnly: false, style: {}, scrollHeight: 96,
        selectionStart: 0, selectionEnd: 0,
        addEventListener() {}, focus() {},
        setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
    })}
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/06.UI/06.Forms/35.MarkDownTextArea.js'), 'utf8'), context);
const Markdown = context.Colibri.UI.Forms.MarkDownTextArea;

test('is a standalone Forms.Field and preserves string values', () => {
    const field = new Markdown('note', {default: '**hello**', params: {submit: true}});
    assert.ok(field instanceof FormField);
    assert.equal(field instanceof context.Colibri.UI.Forms.TextArea, false);
    assert.equal(field.value, '**hello**');
    assert.equal(field._previewButton.icon, 'Colibri.UI.EyeIcon');
    assert.equal(field._formatButtons.code.value, '&lt;/&gt;');
    assert.equal(field._sendButton.icon, 'Colibri.UI.SendMessageIcon');
    field.value = null;
    assert.equal(field.value, '');
    field.placeholder = 'Comment';
    assert.equal(field.placeholder, 'Comment');
    field.enabled = 'false';
    assert.equal(field.enabled, false);
    field.enabled = true;
    field.enabled = true;
    assert.equal(field.classes.has('app-component-disabled'), false);
    field.readonly = 'true';
    assert.equal(field.readonly, true);
});

test('formats the selected text and emits a normal Form change', () => {
    const field = new Markdown('note', {default: 'hello', params: {}});
    field._input.selectionStart = 0;
    field._input.selectionEnd = 5;
    const changes = [];
    field.AddHandler('Changed', (event, args) => changes.push(args));
    field.Format('bold');
    assert.equal(field.value, '**hello**');
    assert.equal(field._input.selectionStart, 2);
    assert.equal(field._input.selectionEnd, 7);
    assert.equal(changes.length, 1);
    assert.equal(changes[0].original, 'hello');
    field.readonly = true;
    field.Format('italic');
    assert.equal(field.value, '**hello**');
});

test('supports native preview without changing the Markdown source', () => {
    const field = new Markdown('note', {default: '**hello**', params: {}});
    field.preview = true;
    assert.equal(field._input.style.display, 'none');
    assert.equal(field._previewPane.shown, true);
    assert.equal(field._previewPane.value, '<p><strong>hello</strong></p>');
    field.preview = false;
    assert.equal(field.value, '**hello**');
    assert.equal(field._input.style.display, '');
});

test('grows input up to maxHeight and respects emptyAsNull', () => {
    const field = new Markdown('note', {params: {minHeight: 80, maxHeight: 200, emptyAsNull: true}});
    assert.equal(field.value, null);
    field._input.scrollHeight = 420;
    field.value = 'content';
    assert.equal(field._input.style.height, '200px');
    assert.equal(field._input.style.overflowY, 'auto');
});

test('requests submission with Ctrl+Enter but leaves normal Enter alone', () => {
    const field = new Markdown('note', {default: 'comment', params: {submit: true}});
    const requests = [];
    field.AddHandler('SubmitRequested', (event, args) => requests.push(args.value));
    let prevented = false;
    const event = {key: 'Enter', ctrlKey: false, metaKey: false, isComposing: false, stopPropagation() {}, preventDefault() { prevented = true; }};
    field.__inputKeyDown(event);
    assert.equal(prevented, false);
    event.ctrlKey = true;
    field.__inputKeyDown(event);
    assert.equal(prevented, true);
    assert.deepEqual(requests, ['comment']);
    field.enabled = false;
    field.Submit();
    field.enabled = true;
    field.readonly = true;
    field.Submit();
    assert.equal(requests.length, 1);
    field.readonly = false;
    field.value = '   ';
    field.Submit();
    assert.equal(requests.length, 1);
});

test('formats lines, links and empty selections without swallowing other text', () => {
    assert.equal(Markdown.FormatSelection('one\ntwo', 0, 7, 'list').value, '- one\n- two');
    assert.equal(Markdown.FormatSelection('one', 1, 1, 'quote').value, '> one');
    assert.equal(Markdown.FormatSelection('', 0, 0, 'bold').value, '****');
    const link = Markdown.FormatSelection('hello', 0, 5, 'link');
    assert.equal(link.value, '[hello](https://)');
    assert.equal(link.value.slice(link.start, link.end), 'https://');
});

test('renders headings, paragraphs, lists, quotes and fenced code', () => {
    const html = Markdown.RenderMarkdown('# Title\n\n**Bold** and *italic* with `inline`\nnext line\n\n- one\n- two\n\n1. first\n2. second\n\n> quote\n\n```js\nif (value < 2) {}\n```');
    assert.match(html, /<h1>Title<\/h1>/);
    assert.match(html, /<strong>Bold<\/strong>/);
    assert.match(html, /<em>italic<\/em>/);
    assert.match(html, /<code>inline<\/code><br>next line/);
    assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
    assert.match(html, /<ol><li>first<\/li><li>second<\/li><\/ol>/);
    assert.match(html, /<blockquote><p>quote<\/p><\/blockquote>/);
    assert.match(html, /<pre><code class="language-js">if \(value &lt; 2\) \{\}<\/code><\/pre>/);
});

test('escapes HTML, script URLs and attribute injection without external sanitizers', () => {
    const html = Markdown.RenderMarkdown('<img src=x onerror=alert(1)>\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n[bad](data:text/html,evil)\n[safe](https://example.com/?a=1&b=2)');
    assert.ok(!html.includes('<img'));
    assert.ok(!html.includes('<script'));
    assert.ok(!html.includes('href="javascript:'));
    assert.ok(!html.includes('href="data:'));
    assert.match(html, /href="https:\/\/example.com\/\?a=1&amp;b=2"/);
    assert.ok(!Markdown.RenderMarkdown('[x](java\tscript:alert)').includes('href='));
    assert.equal(Markdown.RenderMarkdown('```\n<script>\n```'), '<pre><code>&lt;script&gt;</code></pre>');
});