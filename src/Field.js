// Import modules
const mustache = require('mustache');
const utils = require('./utils.js');

/**
 * @class Field
 * @hideconstructor
 */
const Field = (function () {
    /**
     * Constructor.
     *
     * @memberof Field
     * @method new Field(config)
     *
     * @public
     * @param {object} config - Field config. See `Field.prototype.config`.
     * @returns {Field}
     */
    function Field(config) {
        // Create new object to prevent mutation of defaults and parameter
        // Shallow copy only
        this.config = Object.assign({}, Field.prototype.config, config || {});
    }

    /**
     * List of error messages set when validate() is called
     *
     * @memberof Field
     * @instance
     *
     * @public
     * @type {string[]}
     */
    Field.prototype.errors = [];

    /**
     * Configuration defaults for field
     *
     * @memberof Field
     * @instance
     *
     * @public
     * @type {object}
     * @property {boolean} disabled - Whether this field is disabled.
     * @property {string} emptyOptionText - Text in `<option>` element where value is empty.
     * @property {string} errorsTemplate - Mustache.js template for rendering
     *     array of error messages for each field. Overrides errorsTemplate set by form
     *     if specified.
     * @property {object} fieldAttributes - Key-value pairs for attributes in `<div>` element
     *     containing the field. Use empty string if the attribute has no value, null to unset
     *     the attribute.
     * @property {string[]} fieldClasses - List of CSS classes for `<div>` element
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
     * @property {string[]} labelClasses - List of CSS classes for `<label>` element.
     * @property {string} name - Field name. Overrides name set by form if specified.
     * @property {string} note - Optional note displayed with input element.
     * @property {string[]} noteClasses - List of CSS classes for `<div>` element for note.
     * @property {object} options - Key-value pairs used for `<option>` elements in `<select>`
     *     element used as such: `<option value="${key}">${value}</option>`.
     * @property {boolean} readonly - Whether this field is readonly.
     * @property {boolean} required - Whether this field is required. In-built validation if this
     *     is true and field is not disabled/readonly.
     * @property {string} requiredText - Text to return for error message if value is empty for
     *     required field. Default is empty string as Form.config.requiredText can be set to
     *     provide a global value for all fields.
     * @property {string|number|array} value - Value for input. Use an array if input has multiple
     *     values, e.g. multi-select checkbox group. Note that field values in web form submissions
     *     are always of string type, hence no catering for null/undefined/boolean types.
     * @property {function(string,string,object): boolean} validateFunction - Function for
     *     validating submitted input value. Does not override in-built validation. Takes in
     *     (name of field in form, submitted value, values for all fields in form) and
     *     returns an array of error messages.
     */
    Field.prototype.config = { // in alphabetical order, properties before functions
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
        options: null,
        readonly: false,
        required: false,
        requiredText: '',
        value: '',
        validateFunction: null,
    };

    /**
     * Renders HTML for field
     *
     * @memberof Field
     * @instance
     *
     * @public
     * @param {(null|object)} [templateVariables=null] - Optional key-value pairs
     *     that can be used to add on to or override template variables for the
     *     final rendering (not for intermediate renders such as input and errors).
     * @returns {string}
     */
    Field.prototype.render = function (templateVariables = null) {
        let self = this; // for use inside callbacks

        // Handling for select/checkbox/radio fields. May have multiple values passed as array.
        let selectOptions = [];
        let hasSelectedOption = false;
        let values = self.config.value;
        if ([null, undefined, ''].includes(values)) { // cannot use `if (!values)` cos values may be 0 or false
            values = [];
        } else {
            // Cast all values to string cos ['1'].includes(1) and [1].includes['1'] return false
            values = (Array.isArray(values) ? values : [values]).map((val) => val.toString());
        }
        Object.keys(this.config.options || {}).forEach(function (optionValue) {
            let isSelected = values.includes(optionValue.toString()); // need to cast to string else may not work
            if (isSelected) {
                hasSelectedOption = true;
            }

            selectOptions.push({ // keys correspond to Mustache.js template variables
                optionValue: optionValue,
                optionText: self.config.options[optionValue],
                optionSelected: isSelected,
            });
        });

        // Input element
        let inputHtml = mustache.render(
            this.config.inputTemplate || '',
            {
                name: this.config.name,
                type: this.config.inputType,
                attributes: utils.attributesToString(Object.assign(
                    {
                        disabled: this.config.disabled ? '' : null,
                        readonly: this.config.readonly ? '' : null,
                        required: this.config.required ? '' : null,
                    },
                    this.config.inputAttributes || {},
                )),
                classes: this.config.inputClasses.join(' '),
                emptyOptionText: this.config.emptyOptionText,
                hasSelectedOption: hasSelectedOption,
                options: selectOptions,
                value: this.config.value,
            }
        );

        // Errors
        let errorsHtml = mustache.render(
            this.config.errorsTemplate || '',
            {
                errors: this.errors,
            }
        );

        return mustache.render(
            this.config.fieldTemplate || '',
            Object.assign(
                {
                    name: this.config.name,
                    fieldAttributes: utils.attributesToString(this.config.fieldAttributes),
                    fieldClasses: this.config.fieldClasses.join(' '),
                    label: this.config.label,
                    labelAttributes: utils.attributesToString(this.config.labelAttributes),
                    labelClasses: this.config.labelClasses.join(' '),
                    note: this.config.note,
                    noteClasses: this.config.noteClasses.join(' '),
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
     * @memberof Field
     * @instance
     *
     * Values and errors, if any, will be stored in field after validation.
     * This is to aid when rendering the form after validation.
     *
     * @public
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

        // In-built validation for required check
        if (this.config.required) {
            // Do not run required check for disabled/readonly fields
            if (!this.config.disabled && !this.config.readonly
                && ['', undefined, null].includes(fieldValue) // does not check array or {}
            ) {
                errors.push(this.config.requiredText);
            }
        }

        // This does not override in-built validation cos field config not passed in,
        // i.e. cannot check config.required/disabled/readonly
        let validateFn = this.config.validateFunction;
        if (validateFn && 'function' === typeof validateFn) {
            errors.push(...validateFn(fieldName, fieldValue, formData));
        }

        // Store value and errors to aid rendering later
        this.config.value = fieldValue || this.config.value; // need fallback cos Submit button won't have value
        this.errors = errors;

        return errors;
    };

    return Field;
})();

// JSDoc: Need to assign IIFE to variable instead of module.exports
// and add @memberof/@instance tags to all properties/methods else docs cannot be generated
module.exports = Field;
