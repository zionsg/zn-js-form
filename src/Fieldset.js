// Import modules
const mustache = require('mustache');
const utils = require('./utils.js');

/**
 * @class
 */
module.exports = (function () {
    /**
     * Constructor
     *
     * @public
     * @constructor
     * @param {object} options - Fieldset options. See `Fieldset.prototype.options`.
     */
    function Fieldset(options) {
        // Create new object to prevent mutation of defaults and parameter
        // Shallow copy only
        this.options = Object.assign({}, Fieldset.prototype.options, options || {});
    }

    /**
     * Name of fieldset
     *
     * @public
     * @type {string}
     */
    Fieldset.prototype.name = '';

    /**
     * Option defaults for fieldset
     *
     * @public
     * @type {object}
     * @property {string[]} fieldNames - Names of fields grouped under this fieldset.
     * @property {object} fieldsetAttributes - Key-value pairs for attributes in <fieldset> element
     *     Use empty string if the attribute has no value, null to unset the attribute.
     * @property {string[]} fieldsetClasses - List of CSS classes for <fieldset> element.
     * @property {string} fieldsetTemplate - Mustache.js template for rendering
     *     HTML for fieldset element.
     * @property {string} legend - Legend for fieldset.
     * @property {string} name - Fieldset name. Overrides name set by form if specified.
     */
    Fieldset.prototype.options = {
        fieldNames: [],
        fieldsetAttributes: {},
        fieldsetClasses: [],
        fieldsetTemplate: '<fieldset name="{{name}}" '
            + '{{{fieldsetAttributes}}} class="{{{fieldsetClasses}}}">'
            + '<legend>{{legend}}</legend>'
            + '{{{fieldsHtml}}}'
            + '</fieldset>',
        legend: '',
        name: '',
    };

    /**
     * Renders HTML for fieldset
     *
     * @param {object} templateVariables - Optional key-value pairs that can
     *     be used to add on to or override current template variables.
     * @returns {string}
     */
    Fieldset.prototype.render = function (templateVariables = null) {
        return mustache.render(
            this.options.fieldsetTemplate || '',
            Object.assign(
                {
                    name: this.options.name,
                    fieldsetAttributes: utils.attributesToString(this.options.fieldsetAttributes),
                    fieldsetClasses: this.options.fieldsetClasses.join(' '),
                    legend: this.options.legend,
                },
                templateVariables || {}
            )
        );
    };

    // There is no validate() method for fieldsets

    return Fieldset;
})();
