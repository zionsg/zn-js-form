// Import modules
const mustache = require('mustache');

/**
 * @class
 */
module.exports = (function () {
    /**
     * Constructor
     *
     * @public
     * @constructor
     * @param {object} config - Form configuration. See `Form.prototype.config`.
     */
    function Form(config) {
        // Create new object to prevent mutation of defaults and parameter
        this.config = Object.assign({}, Form.prototype.config, config || {});
    }

    /**
     * Configuration defaults for form
     *
     * @public
     * @type {object}
     * @property {string} action - URL for form submission.
     * @property {object} attributes - Key-value pairs for attributes in <form>
     *     element. Use empty string if the attribute has no value, null to
     *     unset the attribute. E.g.:
     *     { enctype: 'multipart/form-data', novalidate: '', required: null }
     *     will produce <form enctype="multipart/form-data" novalidate>.
     * @property {string[]} classes - List of CSS classes for <form> element.
     * @property {string} formTemplate - Mustache.js template for rendering
     *     HTML for <form> element.
     * @property {string} errorsTemplate - Mustache.js template for rendering
     *     array of error messages for each field. It may be overridden in field
     *     config. For simplicity, the classes are embedded in the template
     *     instead of having an `errorClasses` key.
     * @property {object} inputTemplates - Key-value pairs where key is input
     *     type (e.g. text, select) and value is Mustache.js template for
     *     rendering HTML for input element. The appropriate input template is
     *     used when rendering the input for a field and may be overridden in
     *     field config.
     * @property {string} method - HTTP method for form submission.
     * @property {string} name - Form name.
     * @property {string} requiredText - Text to return for error message if
     *     value is empty for required fields. Can be overridden in field
     *     config.
     */
    Form.prototype.config = { // in alphabetical order, properties before functions
        action: '',
        attributes: {},
        classes: [],
        errorsTemplate: '<div class="errors">{{#errors}}<ul>'
            + '<li>{{.}}</li>'
            + '</ul>{{/errors}}</div>',
        formTemplate: '<form name="{{name}}" method="{{method}}" action="{{{action}}}" '
            + '{{{attributes}}} class="{{{classes}}}">{{{formHtml}}}</form>',
        inputTemplates: {
            'input': '<input name="{{name}}" type="{{type}}" value="{{value}}" '
                + '{{{attributes}}} class="{{{classes}}}" />',

            'checkbox': '{{#options}}'
                + '<input name="{{name}}" type="{{type}}" value="{{optionValue}}" '
                + '{{{attributes}}} {{#optionSelected}}checked{{/optionSelected}} '
                + 'class="{{{classes}}}" />{{optionText}}'
                + '{{/options}}',

            'html': '{{{value}}}',

            'radio': '{{#options}}'
                + '<input name="{{name}}" type="{{type}}" value="{{optionValue}}" '
                + '{{{attributes}}} {{#optionSelected}}checked{{/optionSelected}} '
                + 'class="{{{classes}}}" />{{optionText}}'
                + '{{/options}}',

            'select': '<select name="{{name}}" {{{attributes}}} class="{{{classes}}}"> '
                + '<option value="" {{^hasSelectedOption}}selected{{/hasSelectedOption}}>'
                + '{{emptyOptionText}}</option>'
                + '{{#options}}'
                + '  <option value="{{optionValue}}"'
                + '    {{#optionSelected}}selected{{/optionSelected}}>{{optionText}}</option>'
                + '{{/options}}'
                + '</select>',

            'textarea': '<textarea name="{{name}}" {{{attributes}}} '
                + 'class="{{{classes}}}">{{{value}}}</textarea>',

        },
        method: 'POST',
        name: '',
        requiredText: 'This field is required.',
    };

    /**
     * Groups of fields, with each group rendered as a <fieldset> element
     *
     * Key is fieldset name, value is Fieldset object.
     * Uses Map instead of Object/Array so that rendering order can be guaranteed by insertion
     * order and specific fieldsets can be referenced easily by name instead of looping each time,
     * e.g. fieldsets.get('myfieldset').
     *
     * Name is made optional in the Fieldset object to reduce repetitions, e.g.
     * `fieldsets.set('myset', new Fieldset({}))` instead of
     * `fieldsets.set('myset', new Fieldset({ name:'myset' }))`. It is also becos
     * the name of the fieldset is dependent on the form that it is used in.
     *
     * If at least one fieldset is specified, any fields not belonging to a fieldset will
     * not be rendered.
     *
     * @public
     * @type {Map.<string, Fieldset>}
     */
    Form.prototype.fieldsets = new Map();

    /**
     * Fields
     *
     * Key is fieldset name, value is Fieldset object.
     * Uses Map instead of Object/Array so that rendering order can be guaranteed by insertion
     * order and specific fieldsets can be referenced easily by name instead of looping each time,
     * e.g. fieldsets.get('myfieldset').
     *
     * Name is made optional in the Field object to reduce repetitions, e.g.
     * `field.set('myfield', new Field({}))` instead of
     * `field.set('myfield', new Field({ name:'myfield' }))`. It is also becos
     * the name of the field is dependent on the form that it is used in.
     *
     * @public
     * @type {Map.<string, Fieldset>}
     */
    Form.prototype.fields = new Map();

    /**
     * Clear form data
     *
     * @public
     * @returns {void}
     */
    Form.prototype.clearData = function () {
        this.fields.forEach(function (field, fieldName) {
            field.value = ''; // note for web form submissions, empty value is always ""
        });
    };

    /**
     * Get form data
     *
     * @public
     * @returns {object} Key-value pairs where key is field name and value is
     *     field value. Type of value may be string, number or array (multiple values such as for
     *     multi-select checkbox group).
     */
    Form.prototype.getData = function () {
        // Not saving in private instance variable so that data is always the most updated copy
        let result = {};

        this.fields.forEach(function (field, fieldName) {
            result[fieldName] = field.value;
        });

        return result;
    };

    /**
     * Renders HTML for entire form
     *
     * @public
     * @param {(null|object)} [templateVariables=null] - Optional key-value pairs
     *     that can be used to add on to or override current template variables.
     * @returns {string}
     */
    Form.prototype.render = function (templateVariables = null) {
        let self = this; // for use inside callbacks

        let attributes = [];
        for (const [key, value] of Object.entries(this.config.attributes)) {
            if (value !== null) {
                attributes.push(key + ('' === value ? '' : `="${value}"`));
            }
        }

        // Since all fields need to be rendered, might as well store the HTML
        // and index by the field names, for use with fieldsets
        let htmlByField = {};
        this.fields.forEach(function (field, fieldName) {
            // Not exactly best practice to mutate the field object but
            // it will be non-trivial to resolve the values in other ways
            field.config.name = field.config.name || fieldName;

            field.config.errorsTemplate = field.config.errorsTemplate
                || self.config.errorsTemplate;

            field.config.inputTemplate = field.config.inputTemplate
                || self.config.inputTemplates[field.config.inputType]
                || self.config.inputTemplates['input'];

            field.config.requiredText = field.config.requiredText
                || self.config.requiredText;

            htmlByField[fieldName] = field.render();
        });

        // Render all fields if there are no fieldsets, else render fieldsets only
        // Interestingly, '\n' works like "\n". Double quotes disallowed in ESLint.
        let formHtml = '';
        if (0 === this.fieldsets.size) {
            formHtml = Object.values(htmlByField).join('\n');
        } else {
            this.fieldsets.forEach(function (fieldset, fieldsetName) {
                // Not exactly best practice to mutate the fieldset object but
                // it will be non-trivial to resolve the values in other ways
                fieldset.config.name = fieldset.config.name || fieldsetName;

                let fieldsHtml = '';
                fieldset.config.fieldNames.forEach(function (fieldName) {
                    fieldsHtml += (htmlByField[fieldName] || '') + '\n';
                });

                formHtml += fieldset.render({ fieldsHtml: fieldsHtml });
            });
        }

        return mustache.render(
            this.config.formTemplate || '',
            Object.assign(
                {
                    name: this.config.name,
                    method: this.config.method,
                    action: this.config.action,
                    attributes: attributes ? attributes.join(' ') : '',
                    classes: this.config.classes.join(' '),
                    formHtml: formHtml,
                },
                templateVariables || {}
            )
        );
    };

    /**
     * Set form data
     *
     * @public
     * @param {object} formData - Key-value pairs where key is field name and value is
     *     field value. Type of value may be string, number or array (multiple values such as for
     *     multi-select checkbox group).
     * @returns {void}
     */
    Form.prototype.setData = function (formData) {
        // Not saving in private instance variable as the values are saved in the fields themselves
        Object.keys(formData || {}).forEach((fieldName) => {
            if (this.fields.has(fieldName)) {
                this.fields.get(fieldName).value = formData[fieldName];
            }
        });
    };

    /**
     * Validate form
     *
     * Values and errors, if any, will be stored in fields after validation.
     * This is to aid when rendering the form after validation.
     *
     * The method signature allows the validation of a form submission in one
     * line instead of having to call form.setData() each time before calling
     * form.validate(). Example scenario in an Express app:
     *
     *     // If need form.setData() then code for response will be duplicated
     *     if ('GET' === request.method
     *         || ('POST' === request.method && !form.validate(request.body))
     *     ) {
     *         response.send(mustache.render({ // Mustache.js
     *             viewHtml, // template
     *             { record: record }, // template variables
     *             { form_html: form.render() } // partials
     *         }));
     *     }
     *
     * @public
     * @param {(null|object)} [formData=null] - Optional key-value pairs
     *     where the key is the field name and the value is the submitted value.
     *     If null or unspecified, current values in fields will be used for
     *     validation.
     * @returns {(null|object)} Null returned if form is valid, else key-value
     *     pairs are returned, with key being field name and value being
     *     the error message for the field.
     */
    Form.prototype.validate = function (formData = null) {
        if (!formData) {
            formData = this.getFormData();
        }

        let errors = {};
        let hasErrors = false;
        this.fields.forEach((field, fieldName) => {
            let fieldErrors = field.validate(fieldName, formData[fieldName], formData);
            if (fieldErrors.length > 0) {
                hasErrors = true;
                errors[fieldName] = fieldErrors;
            }
        });

        return (hasErrors ? errors : null);
    };

    return Form; // refers to `function Form()` which Form.prototype builds upon
})();
