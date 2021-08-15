// Import modules
const ZnJsForm = require('../src/index.js');
const utils = require('../src/utils.js');

/**
 * Test suite to test rendering
 */
describe('Render', () => {
    let myForm = null; // this will be used for all tests, esp. inputTemplates

    it('Render empty form', () => {
        myForm = new ZnJsForm.Form({
            name: 'myform',
            action: 'https://example.com',
            attributes: {
                enctype: 'multipart/form-data',
                novalidate: '',
                required: null,
            },
        });

        let expectedHtml = '<form name="myform" method="POST" action="https://example.com" enctype="multipart/form-data" novalidate class=""></form>';
        expect(utils.stripWhitespace(myForm.render())).toBe(expectedHtml);
    });

    it('Render text field with readonly', () => {
        let field = new ZnJsForm.Field({
            inputTemplate: myForm.config.inputTemplates['input'], // default template
            inputType: 'text',
            name: 'username',
            label: 'Username',
            required: true,
            requiredText: 'What is your username?',
            fieldClasses: ['field'],
        });

        // Modify field
        field.config.readonly = true;

        let expectedHtml = '<div class="field"><label for="username" class="">Username</label><input name="username" type="text" value="" readonly required class=""></div>';
        expect(utils.stripWhitespace(field.render())).toBe(expectedHtml);
    });

    it('Render select field with errors', () => {
        let field = new ZnJsForm.Field({
            errorsTemplate: myForm.config.errorsTemplate, // default template
            inputTemplate: myForm.config.inputTemplates['select'], // default template
            inputType: 'select',
            name: 'pet',
            label: 'Pets',
            emptyOptionText: '--- Please choose a pet ---',
            options: {
                1: 'cat',
                2: 'dog',
            },
            fieldClasses: ['field'],
            validateFunction: function (fieldName, fieldValue, formData) {
                return (fieldValue !== 'cat') ? ['You must choose a cat.'] : [];
            },
        });

        // Run validation
        field.validate(field.name, 'dog').sort();

        let expectedHtml = '<div class="field"><label for="pet" class="">Pets</label><select name="pet" class=""> <option value="" selected>--- Please choose a pet ---</option> <option value="1" >cat</option> <option value="2" >dog</option></select><div class="errors"><ul><li>You must choose a cat.</li></ul></div></div>';
        expect(utils.stripWhitespace(field.render())).toBe(expectedHtml);
    });
});
