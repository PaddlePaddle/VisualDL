module.exports = {
  extends: [
    'google',
    'plugin:vue/base',
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended',
  ],
  rules: {
    // override/add rules settings here, such as:
    'vue/no-unused-vars': 'warn',
    'max-len': ["warn", 120],
    "vue/prop-name-casing": ["error"],
    'vue/script-indent': 'error',
  }
}
