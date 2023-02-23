
Colibri.UI.Templates = {};

Colibri.UI.AddTemplate = (name, content) => {
    Colibri.UI.Templates[name] = new DOMParser().parseFromString(content, "application/xhtml+xml").children[0];
}