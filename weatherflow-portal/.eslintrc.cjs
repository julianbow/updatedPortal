/* eslint-env node */
module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'vue/no-multiple-template-root': 'off',
    'indent': ['error', 2],
  },
  compilerOptions: {
    "typeRoots": [
      "./node_modules/@types",
      "./types"
    ]
  }
};