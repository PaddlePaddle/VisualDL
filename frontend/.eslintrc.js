module.exports = {
  extends: [
    'google',
    'plugin:vue/base',
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended',
  ],
  parserOptions: {
    'sourceType': 'module',
  },
  rules: {
    // override/add rules settings here, such as:
    'arrow-parens': ['error', 'as-needed'],
    'brace-style': ['warn', 'stroustrup'],
    'comma-dangle': ['error', 'never'],
    'max-len': ['warn', 120],
    'no-console': 'warn',
    'operator-linebreak': ['error', 'before'],
    'quote-props': ['warn', 'as-needed'],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'never'
    }],
    'space-infix-ops': 'error',
    'space-unary-ops': ['warn', {'words': true, 'nonwords': false}],
    'vue/no-unused-vars': 'warn',
    'vue/prop-name-casing': ['error'],
    'vue/script-indent': ['error', 4],

    // The following rules should apply eventually. Turn them off for now
    // so we can have pre-commit running
    'no-invalid-this': 'off',
    'require-jsdoc': 'off',
  }
};
