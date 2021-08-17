// Import modules
const ZnJsForm = require('../src/index.js');
const utils = require('../src/utils.js');

/**
 * Test suite to mimic test.html except appending to container
 */
describe('Mimic test.html', () => {

    it('Render same HTMl as test.html', () => {
        let myForm = new ZnJsForm.Form({
              name: 'myform',
              action: 'https://example.com',
              attributes: {
                  enctype: 'multipart/form-data',
                  novalidate: '', // attribute set with no value if empty string
                  required: null, // attribute not set if value is null
                  onsubmit: 'submitHandler(event)', // validate form on client-side upon submission
              },
        });
        let submitHandler = function (event) {
            event.preventDefault(); // don't submit form to action url
            console.log('Submit event:', event);

            // See https://developer.mozilla.org/en-US/docs/Web/API/FormData
            let formData = new FormData(event.srcElement);
            let submission = {};
            for (let entry of formData.entries()) {
                submission[entry[0]] = entry[1];
            }

            let errors = myForm.validate(submission);
            container.innerHTML = myForm.render(); // render form again after validation

            console.log('Form errors:', errors);
            if (!errors) {
                alert('Congrats, your form submission is valid!');
            }
        };

        myForm.fields.set('username', new ZnJsForm.Field({
            inputType: 'text',
            label: 'Username',
            note: 'This field is readonly.',
            noteClasses: ['note'],
            required: true, // in-built validation if this is true and field not disabled/readonly
            fieldClasses: ['field'],
        }));

        myForm.fields.set('gender', new ZnJsForm.Field({
            inputType: 'radio',
            label: 'Gender',
            options: {
                123: 'Female',
                456: 'Male',
            },
            fieldClasses: ['field'],
            required: true,
        }));

        myForm.fields.set('pet', new ZnJsForm.Field({
            inputType: 'select',
            label: 'Pets',
            emptyOptionText: '--- Please choose a pet ---',
            options: {
                123: 'cat',
                456: 'dog',
            },
            fieldClasses: ['field'],
            validateFunction: function (fieldName, fieldValue, formData) { // optional field validation
                // return an array of error messages
                return (fieldValue !== '123') ? ['You must choose a cat.'] : [];
            },
        }));

        myForm.fields.set('hobbies', new ZnJsForm.Field({
            inputType: 'checkbox',
            label: 'Hobbies',
            fieldClasses: ['field'],
            options: {
                123: 'Cycling',
                456: 'Running',
            },
        }));

        myForm.fields.set('description', new ZnJsForm.Field({
            inputType: 'textarea',
            label: 'Write a short description of yourself',
            fieldClasses: ['field'],
            inputAttributes: {
                rows: 10,
                cols: 40,
            }
        }));

        myForm.fields.set('csrf_token', new ZnJsForm.Field({
            inputType: 'hidden',
            value: 'abcd1234',
            label: '',
            fieldClasses: ['field'],
        }));

        myForm.fields.set('submit', new ZnJsForm.Field({
            inputType: 'submit',
            value: 'Submit Form',
            label: '',
            fieldClasses: ['field'],
        }));

        myForm.fields.set('comments', new ZnJsForm.Field({
            inputType: 'html',
            fieldTemplate: '{{{inputHtml}}}',
            value: `
                <p style="font-family:monospace; font-size:1.5em;">
                  This is a field of "html" type which allows insertion of HTML in between fields.
                  This field was added last but not rendered last due to use of fielsets. Note that
                  if the form has any fieldsets, any fields not belonging to a fieldset
                  will not be rendered. Hence remaining fields like the CSRF token and submit
                  button need to be placed in a final fieldset. Btw this form will validate itself
                  when the Submit button is clicked.
                </p>
            `,
        }));

        // Fieldsets
        myForm.fieldsets.set('fieldset-for-personal-info', new ZnJsForm.Fieldset({
            fieldNames: ['username', 'gender'],
            legend: 'Personal Info',
        }));
        myForm.fieldsets.set('fieldset-for-remaining-fields', new ZnJsForm.Fieldset({
            fieldNames: ['comments', 'pet', 'hobbies', 'description', 'csrf_token', 'submit'],
            fieldsetClasses: ['noborder'],
        }));

        // Modify field
        myForm.fields.get('username').config.readonly = true;

        // Validate dropdown to render errors
        myForm.fields.get('pet').validate('pet', '456', {});

        // Single assertion
        expect(utils.stripWhitespace(myForm.render(), true)).toBe(utils.stripWhitespace(`
            <form name="myform" method="POST" action="https://example.com" enctype="multipart/form-data" novalidate onsubmit="submitHandler(event)" class=""><fieldset name="fieldset-for-personal-info"  class=""><legend>Personal Info</legend><div  class="field"><label for="username"  class="">Username</label><input name="username" type="text" value="" readonly required class="" /><div class="note">This field is readonly.</div><div class="errors"></div></div>
            <div  class="field"><label for="gender"  class="">Gender</label><input name="gender" type="radio" value="123" required  class="" />Female<input name="gender" type="radio" value="456" required  class="" />Male<div class="errors"></div></div>
            </fieldset><fieldset name="fieldset-for-remaining-fields"  class="noborder"><legend></legend>
                            <p style="font-family:monospace; font-size:1.5em;">
                              This is a field of "html" type which allows insertion of HTML in between fields.
                              This field was added last but not rendered last due to use of fielsets. Note that
                              if the form has any fieldsets, any fields not belonging to a fieldset
                              will not be rendered. Hence remaining fields like the CSRF token and submit
                              button need to be placed in a final fieldset. Btw this form will validate itself
                              when the Submit button is clicked.
                            </p>

            <div  class="field"><label for="pet"  class="">Pets</label><select name="pet"  class=""> <option value="" >--- Please choose a pet ---</option>  <option value="123"    >cat</option>  <option value="456"    selected>dog</option></select><div class="errors"><ul><li>You must choose a cat.</li></ul></div></div>
            <div  class="field"><label for="hobbies"  class="">Hobbies</label><input name="hobbies" type="checkbox" value="123"   class="" />Cycling<input name="hobbies" type="checkbox" value="456"   class="" />Running<div class="errors"></div></div>
            <div  class="field"><label for="description"  class="">Write a short description of yourself</label><textarea name="description" rows="10" cols="40" class=""></textarea><div class="errors"></div></div>
            <div  class="field"><label for="csrf_token"  class=""></label><input name="csrf_token" type="hidden" value="abcd1234"  class="" /><div class="errors"></div></div>
            <div  class="field"><label for="submit"  class=""></label><input name="submit" type="submit" value="Submit Form"  class="" /><div class="errors"></div></div>
            </fieldset></form>
        `, true));
    });
});
