/**
 * Templates for UI development
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.Templates = {}

/**
 * @description Add template to
 * @param {string} name Name of template
 * @param {string} content content of template
 * @static
 * @public
 */
Colibri.UI.AddTemplate = (name, content) => {
    Colibri.UI.Templates[name] = new DOMParser().parseFromString(content, "application/xhtml+xml").children[0];
}
