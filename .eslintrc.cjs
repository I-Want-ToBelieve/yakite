/** @type {import("eslint").Linter.Config} */
module.exports =  {
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      extends: 'standard-with-typescript',
      rules: {
        '@typescript-eslint/strict-boolean-expressions': 'off',
        'array-callback-return': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }]
      },
    }
  ]
}

