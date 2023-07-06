module.exports = {
  ...require('prettier-config-standard'),
  bracketSameLine: false,
  overrides: [
    {
      files: 'ketcher-autotests/**/*.{js,ts}',
      options: {
        semi: true,
        trailingComma: 'all'
      }
    }
  ]
}
