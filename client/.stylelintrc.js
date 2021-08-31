module.exports = {
  root: true,
  extends: ['stylelint-config-standard', 'stylelint-plugin-stylus/standard'],
  rules: {
    'stylus/block-opening-brace-space-before': 'always',
    'stylus/pythonic': 'never',
    'stylus/declaration-colon': 'always',
    'stylus/semicolon': 'always',
    'stylus/selector-list-comma': 'always',
    'stylus/media-feature-colon': 'always',
    'stylus/single-line-comment': 'never',
    'declaration-colon-newline-after': 'always-multi-line',
  },
}
