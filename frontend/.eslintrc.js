module.exports = {
  extends: [
    'google',
    'plugin:vue/base',
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended',
  ],
  parserOptions: {
    "sourceType": "module",
  },
  rules: {
    // override/add rules settings here, such as:
    'vue/no-unused-vars': 'warn',
    'max-len': ["warn", 120],
    "vue/prop-name-casing": ["error"],
    'vue/script-indent': 'error',

    // The following rules should apply eventually. Turn them off for now
    // so we can have pre-commit running
    'no-invalid-this': 'off',
    'require-jsdoc': 'off',
  }
}
