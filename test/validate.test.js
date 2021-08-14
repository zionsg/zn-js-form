// Import modules
const ZnJsForm = require('../src/index.js');

/**
 * Test suite to test validation
 */
describe('Validation', () => {
    it('Validate required field with empty value', () => {
        let field = new ZnJsForm.Field({
            name: 'username',
            inputType: 'text',
            required: true,
            requiredText: 'What is your username?',
        });

        let expectedErrors = [field.options.requiredText].sort();
        let actualErrors = field.validate(field.name, '').sort();
        expect(actualErrors).toEqual(expectedErrors);
    });

    it('Validate select field with custom validateFunction', () => {
        let field = new ZnJsForm.Field({
            name: 'pet',
            inputType: 'select',
            choices: {
                1: 'cat',
                2: 'dog',
            },
            validateFunction: function (fieldName, fieldValue, formData) {
                return (fieldValue !== 'cat') ? ['You must choose a cat.'] : [];
            },
        });

        let expectedErrors = ['You must choose a cat.'].sort();
        let actualErrors = field.validate(field.name, 'dog').sort();
        expect(actualErrors).toEqual(expectedErrors);
        expect(field.errors).toEqual(expectedErrors); // check that errors are stored
    });
});
