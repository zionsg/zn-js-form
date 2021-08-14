# Zion's JavaScript Form

A simple library to handle form rendering and validation in Node.js and
JavaScript on web browsers.

Paths in all documentation, even those in subfolders, are relative to the root
of the repository. Shell commands are all run from the root of the repository.

## References
- [Mustache.js](https://github.com/janl/mustache.js): This templating library
  is used for rendering HTML for the form and its components.
- [Bootstrap 5.0 Forms](https://getbootstrap.com/docs/5.0/forms/overview/): This
  library is not used, but the default rendering templates follows its examples.
- [JSDoc](https://jsdoc.app): Used for docblocks in source code.
- Related repositories:
    + [ZnPhp-Form](https://github.com/zionsg/ZnPhp-Form):
      Simple form class to handle config, validation and rendering for fast
      deployment on a PHP site without any framework.
    + [ZnZend Form](https://github.com/zionsg/ZnZend/tree/master/src/Form):
      Form component of library for Zend Framework 2.

## Changelog
- See `CHANGELOG.md`. Note that changes are only documented from v1.0.0 onwards.

## Usage
- For Node.js:
    + Run `npm install zn-js-form` to install the package.
    + Import the module, e.g. `const ZnJsForm = require('zn-js-form');`.
- For JavaScript in web browser:
    + Download this repository into your project directory either by cloning
      it into a subfolder or using NPM to install it into `node_modules`
      subfolder.
    + Include the bundle script `dist/bundle.js` on the webpage, e.g.
      `<script src="zn-js-form/dist/bundle.js"></script>`.
- Sample code (same for Node.js and JavaScript):

        let myForm = new ZnJsForm.Form({
            name: 'myform',
            action: 'https://example.com',
            attributes: {
                enctype: 'multipart/form-data',
                novalidate: '', // attribute set with no value if empty string
                required: null, // attribute not set if value is null
            }
        });

        myForm.fields.set('username', new ZnJsForm.Field({
            inputType: 'text',
            label: 'Username',
            required: true, // in-built validation if this is true
        }));

        myForm.fields.set('pet', new ZnJsForm.Field({
            inputType: 'select',
            label: 'Pets',
            emptyOptionText: '--- Please choose a pet ---',
            choices: {
                1: 'cat',
                2: 'dog',
            },
            validateFunction: function (fieldValue, formData) { // optional field validation
                // return an array of error messages
                return (fieldValue !== 'cat') ? ['You must choose a cat.'] : [];
            },
        }));

        myForm.fields.get('username').options.readonly = true; // modify field
        console.log(myForm.render());

- The above will produce:

        <form name="myform" method="POST" action="https://example.com"
            enctype="multipart/form-data" novalidate class="">
            <div class="field">
                <label for="username" class="">Username</label>
                <input name="username" type="text" value="" readonly required class="">
            </div>

            <div class="field">
                <label for="pet" class="">Pets</label>
                <select name="pet" class="">
                    <option value="" selected>--- Please choose a pet ---</option>
                    <option value="1">cat</option>
                    <option value="2">dog</option>
                </select>
            </div>
        </form>

- Form validation can be done using the `validate()` method, which returns
  `null` if the form is valid or an object containing an array of error messages
  for each field if the form is invalid. Note that a field may have more than
  1 error, depending on the `validateFunction` passed via the field options.
  Errors are stored per field upon validation and will be rendered.
  Sample:

        // Code
        let errors = myForm.validate({
            username: '',
            pet: 'dog',
        });
        console.log(errors);

        // Output
        {
            username: [ 'This field is required.' ],
            pet: [ 'You must choose a cat.' ]
        }

- No fanciful documentation for now. For more details, check the docblocks
  in the source code, especially the form configuration and field options in
  `src/Form.js:Form.prototype.config` and `src/Field.js:Field.prototype.options`
  respectively.
    + Also look at the `test` folder. The `test.html` is an example of how
      this library can be used in a webpage, while `*.test.js` show how it can
      be used in Node.js.

## Installation
- This section is meant for developers.
- Clone this repository.
- Run `npm run install` to install dependencies.
- Run `npm run build` to bundle the code so that it can be used
  in a web browser. The output will be in `dist/bundle.js`.
- Run `npm run watch` to automatically bundle the code each time the source
  code is changed.
- Run `npm run lint` to do linting checks.
- Run `npm run test` to execute tests.
- Todo tasks are marked by `@todo` comments.
- To publish to NPM registry as a public package:
    + Run `npm login` to login to your account on the local machine.
    + Remove `"private": true` from `package.json` if it exists.
    + Run `npm publish --access public`.
    + View the published package at https://www.npmjs.com/package/@zionsg/zn-js-form
      and ensure that the package is public.

## Architecture
- Entity relationships:
    + A form has 0 or more fieldsets, and has 1 or more fields.
    + A fieldset has a legend, and has 1 or more fields.
    + A field has a label and an input.
    + An input can be broadly categorized into these types:
      `<input>`, `<textarea>`, `<select>`, `<progress>`, `<meter>`.
- Conventions:
    + All constructors take in a single parameter of object type. For `Form`,
      that object is the `config` parameter. For all other classes, the object
      is the `options` parameter.
    + All classes have a `render()` method which takes in an object containing
      additional template variables and returns a string.
- Workflow:
    + User runs `let myForm = new ZnJsForm.Form({});`,
      either in Node.js or in JavaScript on a web browser.
    + Entrypoint of library, i.e. `ZnJsForm`, is `src/index.js` which exports
      an object of classes.
    + One of the exported classes is `Form` which is loaded from `src/Form.js`.
    + The `new` statement specifically calls the constructor defined by
      `function Form(config) {}`.
