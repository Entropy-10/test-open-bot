/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: { node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@limegrass/import-alias'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@limegrass/import-alias/import-alias': [
      'error',
      {
        relativeImportOverrides: [
          { path: 'src/lib', depth: 1 },
          { path: 'src/components/**', depth: 0 }
        ]
      }
    ]
  }
}
