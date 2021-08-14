/**
 * Common utility functions
 */
module.exports = (function () {
    /**
     * Self reference - all public properties/methods are stored here and returned as public interface
     *
     * Methods arranged in alphabetical order except for getter-setter pairs.
     *
     * @public
     * @type {object}
     */
    let self = {};

    /**
     * Convert key-value attributes for HTML element to string
     *
     * @example { a:1, b:'', c:null } will become 'a=1 b'.
     * @param {object} attributes - Key-value pairs. If value is empty string,
     *     attribute is set with no value. If value is null, attribute is not
     *     set at all.
     * @returns {string}
     */
    self.attributesToString = function (attributes) {
        let attrList = [];
        for (const [key, value] of Object.entries(attributes || {})) {
            if (value !== null) {
                attrList.push(key + ('' === value ? '' : `="${value}"`));
            }
        }

        return (attrList ? attrList.join(' ') : '');
    };

    /**
     * Strip unnecessary whitespace from HTML
     *
     * @param {string} html
     * @returns {string}
     */
    self.stripWhitespace = function (html) {
        return (html || '').trim().replace(/[\r\n]/g, '').replace(/\s{2,}/g, ' ');
    };

    // Return public interface of IIFE
    return self;
})();
