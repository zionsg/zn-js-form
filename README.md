# Zion's JavaScript Form

A simple library to handle form rendering and validation in Node.js and
JavaScript on web browsers.

Paths in all documentation, even those in subfolders, are relative to the root
of the repository. Shell commands are all run from the root of the repository.

## Sections
- [References](#references)
- [Requirements](#requirements)
- [Changelog](#changelog)
- [Usage](#usage)
- [Installation](#installation)
- [Architecture](#architecture)

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

## Requirements
- [Node.js](https://nodejs.org/) >= 14.17.3 (includes npm 6.14.13).
- [Google Chrome](https://www.google.com/intl/en_sg/chrome/) >= 80.
- `?.` optional chaining and `??` nullish coalescing operator used in
  source code are only supported from Node.js 14 and Chrome 80 onwards.

## Changelog
- See `CHANGELOG.md`. Note that changes are only documented from v1.0.0 onwards.

## Usage
- Visit https://zionsg.github.io/zn-js-form/jsdoc to view the generated JSDoc
  documentation (saved in `docs/jsdoc` folder and served via GitHub Pages
  pointing to `docs/index.html`).
    + Also look at the `test` folder. The `test.html` is an example of how
      this library can be used in a webpage (showcases fieldsets and other
      types of fields), while `*.test.js` show how it can be used in Node.js.
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
            },
        });

        myForm.fields.set('username', new ZnJsForm.Field({
            inputType: 'text',
            label: 'Username',
            note: 'This field is readonly.',
            noteClasses: ['note'],
            required: true, // in-built validation if this is true and field not disabled/readonly
            fieldClasses: ['field'],
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
            // Optional field validation, does not override in-built validation for required field
            validateFunction: function (fieldName, fieldValue, formData) {
                // Return an array of error messages. Note that web forms return string values.
                return (fieldValue !== '123') ? ['You must choose a cat.'] : [];
            },
        }));

        // Modify field
        myForm.fields.get('username').config.readonly = true;

        // Validate dropdown to render errors
        myForm.fields.get('pet').validate('pet', '456', {});

        console.log(myForm.render()); // output can be set as innerHTML of some element in webpage

- The above will produce:

        <form name="myform" method="POST" action="https://example.com"
            enctype="multipart/form-data" novalidate class="">
            <div class="field">
                <label for="username" class="">Username</label>
                <input name="username" type="text" value="" readonly required class="">
                <div class="note">This field is readonly.</div>
                <div class="errors"></div>
            </div>

            <div class="field">
                <label for="pet" class="">Pets</label>
                <select name="pet" class="">
                    <option value="" selected>--- Please choose a pet ---</option>
                    <option value="123">cat</option>
                    <option value="456">dog</option>
                </select>
                <div class="errors">
                    <ul>
                        <li>You must choose a cat.</li>
                    </ul>
                </div>
            </div>
        </form>

- Form validation can be done using the `validate()` method, which returns
  `null` if the form is valid or an object containing an array of error messages
  for each field if the form is invalid. Note that a field may have more than
  1 error, depending on the `validateFunction` passed via the field config.
  Values and errors are stored per field upon validation so that they will
  be populated if the form gets rendered after validation.
  Sample:

        // Code
        let errors = myForm.validate({
            username: '',
            pet: '456',
        });
        console.log(errors);

        // Output
        {
            username: [ 'This field is required.' ],
            pet: [ 'You must choose a cat.' ]
        }

- Advanced field example. Render a field as dropdown in edit mode and render as
  a disabled input field if not in edit mode. The edit mode can be indicated
  via a boolean template variable, e.g. `editMode`, passed to `render()`.
  Sample code:

        myForm.config.inputTemplates['ifEditModeShowDropdownElseShowDisabledInput'] = `
            {{^editMode}}
                <input name="{{name}}" type="text" value="{{selectedOptionText}} (id:{{value}})"
                    {{{attributes}}} class="{{{classes}}}" disabled />
            {{/editMode}}
            {{#editMode}}
                <select name="{{name}}" {{{attributes}}} class="{{{classes}}}">
                    <option value="" {{^hasSelectedOption}}selected{{/hasSelectedOption}}>
                        {{emptyOptionText}}</option>
                    {{#options}}
                        <option value="{{optionValue}}"
                            {{#optionSelected}}selected{{/optionSelected}}>{{optionText}}</option>
                    {{/options}}
                </select>
            {{/editMode}}
        `;

        myForm.fields.set('advanced_field', new ZnJsForm.Field({
            inputType: 'ifEditModeShowDropdownElseShowDisabledInput',
            label: 'Advanced Field',
            value: 123,
            note: '(if editMode template variable passed to render() is true, show dropdown, else show disabled input)',
            noteClasses: ['note'],
            options: {
                123: 'Cycling',
                456: 'Running',
            },
        }));

        myForm.render({
            editMode: false,
        });

## Installation
- This section is meant for developers. Todo tasks are marked by `@todo` comments.
- Clone this repository.
- Run `npm run install` to install dependencies.
- Other NPM scripts:
    + `npm run build`: Bundle the source code so that it can be used
      in a web browser. The output will be in `dist/bundle.js`.
    + `npm run watch`: Automatically bundle the code each time the source
      code is changed on the local machine.
    + `npm run doc`: Generate JSDoc documentation and save in `docs/jsdoc`
      folder.
    + `npm run lint`: Linting checks.
    + `npm run test`: Execute tests.
- To publish to NPM registry as a public package:
    + Update the application version:
        * Update `version` key in `package.json`.
        * Update version in `package-lock.json` by running `npm install --package-lock-only`.
        * Update the bundle script by running `npm run build`.
    + This part only needs to be done once.
        * Login to https://www.npmjs.com
            - Go to "Access Tokens".
            - Click "Generate New Token".
            - Select "Publish".
            - Copy the token - it will not be displayed again.
        * Create a `.npmrc` file in the root of the cloned repository and add the
          line `//registry.npmjs.org/:_authToken=YOUR-ACCESS-TOKEN`, replacing the
          last part with your token.
        * Run `npm login` to login to your account on the local machine.
        * Remove `"private": true` from `package.json` if it exists.
    + Run `npm publish --access public`.
    + View the published package at https://www.npmjs.com/package/zn-js-form
      and ensure that the package is public.

## Architecture
- Entity relationships:
    + A form has 0 or more fieldsets, and has 1 or more fields.
    + A fieldset has a legend, and has 1 or more fields.
    + A field has a label and an input.
    + An input can be broadly categorized into these types:
      `<input>`, `<textarea>`, `<select>`, `<progress>`, `<meter>`.
    + Semantically, options are different from choices. A select/checbox/radio
      presents the user with a fixed list of options but the user makes a choice
      amongst them.
- Conventions:
    + The variables defined in a method signature are called method parameters.
      The values passed to a method when calling it are called method arguments.
    + Note that for typical web form submissions, field values are always
      of string or array type (multiple values such as for multi-select
      checkbox groups).
        * A value of an empty string implies an empty value for a field, i.e.
          the user did not key in anything for the field.
        * Even if a user keys in a number, it will be submitted as a string.
        * Hence, a field would not have null/undefined/boolean values.
    + All constructors take in a single parameter of object type, which is
      the configuration.
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
