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
     *     options. For simplicity, the classes are embedded in the template
     *     instead of having an `errorClasses` key.
     * @property {object} inputTemplates - Key-value pairs where key is input
     *     type (e.g. text, select) and value is Mustache.js template for
     *     rendering HTML for input element. The appropriate input template is
     *     used when rendering the input for a field and may be overridden in
     *     field options.
     * @property {string} method - HTTP method for form submission.
     * @property {string} name - Form name.
     * @property {string} requiredText - Text to return for error message if
     *     value is empty for required fields. Can be overridden in field options.
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
                + '{{{attributes}}} class="{{{classes}}}">',

            'select': '<select name="{{name}}" {{{attributes}}} class="{{{classes}}}"> '
                + '<option value="" {{^hasSelectedOption}}selected{{/hasSelectedOption}}>'
                + '{{emptyOptionText}}</option>'
                + '{{#selectOptions}}'
                + '  <option value="{{optionValue}}"'
                + '    {{#optionSelected}}selected{{/optionSelected}}>{{optionText}}</option>'
                + '{{/selectOptions}}'
                + '</select>',
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
     * Renders HTML for entire form
     *
     * @param {object} templateVariables - Optional key-value pairs that can
     *     be used to add on to or override current template variables.
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
            field.options.name = field.options.name || fieldName;

            field.options.errorsTemplate = field.options.errorsTemplate
                || self.config.errorsTemplate;

            field.options.inputTemplate = field.options.inputTemplate
                || self.config.inputTemplates[field.options.inputType]
                || self.config.inputTemplates['input'];

            field.options.requiredText = field.options.requiredText
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
                fieldset.options.name = fieldset.options.name || fieldsetName;

                let fieldsHtml = '';
                fieldset.fieldNames.forEach(function (fieldName) {
                    fieldsHtml += (htmlByField[fieldName] || '') + '\n';
                });

                formHtml = fieldset.render({ fieldsHtml: fieldsHtml });
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
     * Validate form
     *
     * @param {object} formData - Submitted values for form as key-value pairs
     *     where the key is the field name and the value is the submitted value.
     * @returns {(null|object)} Null returned if form is valid, else key-value
     *     pairs are returned, with key being field name and value being
     *     the error message for the field.
     */
    Form.prototype.validate = function (formData) {
        let errors = {};
        let hasErrors = false;
        this.fields.forEach((field, fieldName) => {
            let fieldErrors = field.validate(fieldName, formData[fieldName], formData);
            if (fieldErrors) {
                hasErrors = true;
                errors[fieldName] = fieldErrors;
            }
        });

        return (hasErrors ? errors : null);
    };

    return Form; // refers to `function Form()` which Form.prototype builds upon
})();
