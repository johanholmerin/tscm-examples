const path = require('path');
const fs = require('fs');
const t = require('@babel/types');
const babel = require('@babel/parser');

/**
 * @type {import('tscm/macro').Macro}
 */
module.exports.const_json = function const_json({ node, fileName }) {
  const pathStringLiteral = node.arguments[0];
  t.assertStringLiteral(pathStringLiteral);

  const json = fs.readFileSync(
    path.join(path.parse(fileName).dir, pathStringLiteral.value),
    'utf8'
  );

  return babel.parseExpression(`(${json}) as const`, {
    sourceType: 'module',
    plugins: ['typescript']
  });
};
