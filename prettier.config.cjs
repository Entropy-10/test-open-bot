/** @type {PrettierConfig} */
const config = {
  arrowParens: 'avoid',
  printWidth: 80,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  trailingComma: 'none',
  tabWidth: 2,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '',
    '^(zenith)$',
    '^(@db|@env|@utils|@sheets|@schema|@logger|@supabase)$',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '^~/lib/(.*)$',
    '^~/components/(.*)$',
    '^~/(.*)$',
    '^[.]',
    '',
    '<TYPES>',
    '<TYPES>^[.]'
  ],
  importOrderParserPlugins: ['typescript'],
  importOrderTypeScriptVersion: '5.0.0'
}

module.exports = config
