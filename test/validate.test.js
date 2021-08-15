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

        let expectedErrors = [field.config.requiredText].sort();
        let actualErrors = field.validate(field.name, '').sort();
        expect(actualErrors).toEqual(expectedErrors);
    });

    it('Validate select field with custom validateFunction', () => {
        let field = new ZnJsForm.Field({
            name: 'pet',
            inputType: 'select',
            options: {
                123: 'cat',
                456: 'dog',
            },
            validateFunction: function (fieldName, fieldValue, formData) {
                return (fieldValue !== '123') ? ['You must choose a cat.'] : [];
            },
        });

        let expectedErrors = ['You must choose a cat.'].sort();
        let actualErrors = field.validate(field.name, '456').sort();
        expect(actualErrors).toEqual(expectedErrors);
        expect(field.errors).toEqual(expectedErrors); // check that errors are stored
    });
});
