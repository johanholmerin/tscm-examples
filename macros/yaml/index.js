const path = require('path');
const fs = require('fs');
const t = require('@babel/types');
const yaml = require('js-yaml');
const babel = require('@babel/parser');

/**
 * @type {import('tscm/macro').Macro}
 */
module.exports.yaml = function ({ node, fileName }) {
  const stringLiteral = node.arguments[0];
  t.assertStringLiteral(stringLiteral);
  const ymlFile = fs.readFileSync(
    path.join(path.parse(fileName).dir, stringLiteral.value),
    'utf8'
  );
  const doc = yaml.load(ymlFile);
  return babel.parse(JSON.stringify(doc));
};
