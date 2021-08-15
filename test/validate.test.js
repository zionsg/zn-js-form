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

    it('Do not validate required field that is disabled/readonly', () => {
        let field = new ZnJsForm.Field({
            name: 'username',
            inputType: 'text',
            required: true,
            disabled: true,
            readonly: true,
        });

        let actualErrors = field.validate(field.name, '').sort();
        expect(actualErrors).toEqual([]);
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

    it('Validate multiple select checkboxes', () => {
        let field = new ZnJsForm.Field({
            name: 'hobbies',
            inputType: 'checkbox',
            options: {
                123: 'Cycling',
                456: 'Running',
            },
            validateFunction: function (fieldName, fieldValue, formData) {
                return (Array.isArray(fieldValue) && 2 === fieldValue.length) ? [] : ['You must tick both options.'];
            },
        });

        // No errors expected
        let expectedErrors = [];
        let actualErrors = field.validate(field.name, ['123', '456']).sort();
        expect(actualErrors).toEqual(expectedErrors);
        expect(field.errors).toEqual(expectedErrors); // check that errors are stored
    });
});
