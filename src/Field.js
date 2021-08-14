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
     * @param {object} options - Field options. See `Field.prototype.options`.
     */
    function Field(options) {
        // Create new object to prevent mutation of defaults and parameter
        // Shallow copy only
        this.options = Object.assign({}, Field.prototype.options, options || {});
    }

    /**
     * List of error messages set when validate() is called
     *
     * @type {string[]}
     */
    Field.prototype.errors = [];

    /**
     * Option defaults for field
     *
     * @public
     * @type {object}
     * @property {object} choices - Key-value pairs used for <option> elements in <select> element,
     *                              used as such: <option value="${key}">${value}</option>.
     * @property {boolean} disabled - Whether this field is disabled.
     * @property {string} emptyOptionText - Text in <option> element where value is empty.
     * @property {string} errorsTemplate - Mustache.js template for rendering
     *     array of error messages for each field. Overrides errorsTemplate set by form
     *     if specified.
     * @property {object} fieldAttributes - Key-value pairs for attributes in <div> element
     *     containing the field. Use empty string if the attribute has no value, null to unset
     *     the attribute.
     * @property {string[]} fieldClasses - List of CSS classes for <div> element
     *     containing the field.
     * @property {string} fieldTemplate - Mustache.js template for rendering HTML for field
     *     element. The `errorsHtml` template variable is rendered using errorsTemplate.
     * @property {object} inputAttributes - Key-value pairs for attributes in
     *     input element. Use empty string if the attribute has no value, null to
     *     unset the attribute.
     * @property {string[]} inputClasses - List of CSS classes for input element.
     * @property {string} inputTemplate - Mustache.js template for rendering
     *     HTML for input element.
     * @property {string} inputType - Type of input, e.g. text, select, textarea, radio, checkbox.
     * @property {string} label - Label for field.
     * @property {object} labelAttributes - Key-value pairs for attributes in
     *     <label>. Use empty string if the attribute has no value, null to
     *     unset the attribute.
     * @property {string[]} labelClasses - List of CSS classes for <label> element.
     * @property {string} name - Field name. Overrides name set by form if specified.
     * @property {string} note - Optional note displayed with input element.
     * @property {string[]} noteClasses - List of CSS classes for <div> element for note.
     * @property {boolean} readonly - Whether this field is readonly.
     * @property {boolean} required - Whether this field is required.
     * @property {string} requiredText - Text to return for error message if value is empty for
     *     required field. Default is empty string as Form.config.requiredText can be set to
     *     provide a global value for all fields.
     * @property {mixed} value - Value for input.
     * @property {function(string,string,object): boolean} validateFunction - Function for
     *     validating submitted input value. Takes in
     *     (name of field in form, submitted value, values for all fields in form) and
     *     returns an array of error messages.
     */
    Field.prototype.options = { // in alphabetical order, properties before functions
        choices: null,
        disabled: false,
        emptyOptionText: 'Please select an option',
        errorsTemplate: '',
        fieldAttributes: {},
        fieldClasses: [],
        fieldTemplate: '<div {{{fieldAttributes}}} class="{{{fieldClasses}}}">'
            + '<label for="{{{name}}}" {{{labelAttributes}}} class="{{{labelClasses}}}">'
            + '{{label}}</label>'
            + '{{{inputHtml}}}'
            + '{{#note}}<div class="{{{noteClasses}}}">{{{note}}}</div>{{/note}}'
            + '{{{errorsHtml}}}'
            + '</div>',
        inputAttributes: {},
        inputClasses: [],
        inputTemplate: '',
        inputType: 'text',
        label: '',
        labelAttributes: {},
        labelClasses: [],
        name: '',
        note: '',
        noteClasses: [],
        readonly: false,
        required: false,
        requiredText: '',
        value: '',
        validateFunction: null,
    };

    /**
     * Renders HTML for field
     *
     * @param {object} templateVariables - Optional key-value pairs that can
     *     be used to add on to or override template variables for the final
     *     rendering (not for intermediate renders such as input and errors).
     * @returns {string}
     */
    Field.prototype.render = function (templateVariables = null) {
        let self = this; // for use inside callbacks

        // Handling for dropdowns
        let selectOptions = [];
        let hasSelectedOption = false;
        Object.keys(this.options.choices || {}).forEach(function (optionValue) {
            if (optionValue === self.options.value) {
                hasSelectedOption = true;
            }

            selectOptions.push({ // keys correspond to Mustache.js template variables
                optionValue: optionValue,
                optionText: self.options.choices[optionValue],
                optionSelected: (optionValue === self.options.value),
            });
        });

        // Input element
        let inputHtml = mustache.render(
            this.options.inputTemplate || '',
            {
                name: this.options.name,
                type: this.options.inputType,
                attributes: utils.attributesToString(Object.assign(
                    {
                        disabled: this.options.disabled ? '' : null,
                        readonly: this.options.readonly ? '' : null,
                        required: this.options.required ? '' : null,
                    },
                    this.options.inputAttributes || {},
                )),
                classes: this.options.inputClasses.join(' '),
                selectOptions: selectOptions,
                hasSelectedOption: hasSelectedOption,
                emptyOptionText: this.options.emptyOptionText,
            }
        );

        // Errors
        let errorsHtml = mustache.render(
            this.options.errorsTemplate || '',
            {
                errors: this.errors,
            }
        );

        return mustache.render(
            this.options.fieldTemplate || '',
            Object.assign(
                {
                    name: this.options.name,
                    fieldAttributes: utils.attributesToString(this.options.fieldAttributes),
                    fieldClasses: this.options.fieldClasses.join(' '),
                    label: this.options.label,
                    labelAttributes: utils.attributesToString(this.options.labelAttributes),
                    labelClasses: this.options.labelClasses.join(' '),
                    note: this.options.note,
                    noteClasses: this.options.noteClasses.join(' '),
                    inputHtml: inputHtml,
                    errorsHtml: errorsHtml,
                },
                templateVariables || {}
            )
        );
    };

    /**
     * Validate field
     *
     * Errors, if any, will be stored in field after validation.
     *
     * @param {mixed} fieldName - Name of field as in formData. Note that
     *     a field may have different names when used in different forms.
     * @param {mixed} fieldValue - Submitted value for field.
     * @param {object} formData - Submitted values for form as key-value pairs
     *     where the key is the field name and the value is the submitted value.
     *     This is passed in as the field may depend on the values of other
     *     fields in the form.
     * @returns {string[]} Empty array returned if field is valid, else array
     *     of error messages is returned. There may be more than 1 error
     *     message hence an array.
     */
    Field.prototype.validate = function (fieldName, fieldValue, formData) {
        let errors = [];

        if (this.options.required && ['', undefined, null].includes(fieldValue)) {
            errors.push(this.options.requiredText);
        }

        let validateFn = this.options.validateFunction;
        if (validateFn && 'function' === typeof validateFn) {
            errors.push(...validateFn(fieldName, fieldValue, formData));
        }

        // Store errors for rendering purposes
        this.errors = errors;

        return errors;
    };

    return Field;
})();
