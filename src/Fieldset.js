// Import modules
const mustache = require('mustache');
const utils = require('./utils.js');

/**
 * @class Fieldset
 * @hideconstructor
 */
const Fieldset = (function () {
    /**
     * Constructor.
     *
     * @memberof Fieldset
     * @method new Fieldset(config)
     *
     * @public
     * @param {object} config - Fieldset config. See `Fieldset.prototype.config`.
     * @returns {Fieldset}
     */
    function Fieldset(config) {
        // Create new object to prevent mutation of defaults and parameter
        // Shallow copy only
        this.config = Object.assign({}, Fieldset.prototype.config, config || {});
    }

    /**
     * Name of fieldset.
     *
     * @memberof Fieldset
     * @instance
     *
     * @public
     * @type {string}
     */
    Fieldset.prototype.name = '';

    /**
     * Configuration defaults for fieldset.
     *
     * @memberof Fieldset
     * @instance
     *
     * @public
     * @type {object}
     * @property {string[]} fieldNames - Names of fields grouped under this fieldset. Field objects
     *     are added to the form, not the fieldset, as it would be easier to keep track of all
     *     the fields in the form. Hence the fieldset only saves the names of the fields in it,
     *     not the fields themselves.
     * @property {object} fieldsetAttributes - Key-value pairs for attributes in `<fieldset>`
     *     element. Use empty string if the attribute has no value, null to unset the attribute.
     * @property {string[]} fieldsetClasses - List of CSS classes for `<fieldset>` element.
     * @property {string} fieldsetTemplate - Mustache.js template for rendering
     *     HTML for fieldset element.
     * @property {string} legend - Legend for fieldset.
     * @property {string} name - Fieldset name. Overrides name set by form if specified.
     */
    Fieldset.prototype.config = {
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
     * Renders HTML for fieldset.
     *
     * @memberof Fieldset
     * @instance
     *
     * @public
     * @param {(null|object)} [templateVariables=null] - Optional key-value pairs
     *     that can be used to add on to or override current template variables.
     * @returns {string}
     */
    Fieldset.prototype.render = function (templateVariables = null) {
        // Resolve values for special keys that may be passed in via templateVariables
        // Values from fieldset config will override those from templateVariables
        templateVariables = templateVariables || {};
        let name = this.config.name || templateVariables.name || '';

        return mustache.render(
            this.config.fieldsetTemplate || '',
            Object.assign(
                {
                    name: name,
                    fieldsetAttributes: utils.attributesToString(this.config.fieldsetAttributes),
                    fieldsetClasses: this.config.fieldsetClasses.join(' '),
                    legend: this.config.legend,
                },
                templateVariables || {}
            )
        );
    };

    // There is no validate() method for fieldsets

    return Fieldset;
})();

// JSDoc: Need to assign IIFE to variable instead of module.exports
// and add @memberof/@instance tags to all properties/methods else docs cannot be generated
module.exports = Fieldset;
