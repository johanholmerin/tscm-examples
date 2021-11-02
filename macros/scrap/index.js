const assert = require('assert');
const t = require('@babel/types');
const babel = require('@babel/parser');

// Can't use ES modules because they are async, transform on the fly
require('@babel/register')({
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  ignore: []
});

const scrapParse = require('@scrap-js/scrap/src/parser.mjs').default;

function getString(arg) {
  if (t.isStringLiteral(arg)) {
    return arg.value;
  }

  if (t.isTemplateLiteral(arg)) {
    assert.equal(arg.quasis.length, 1, 'String must be static');
    return arg.quasis[0].value.cooked;
  }

  throw new Error(`Argument must be string, got ${arg.type}`);
}

function getType(type) {
  switch (type.type) {
    case 'BaseType':
      return type.name + 'Data';
    case 'UnionType':
      return type.alternatives.map(getType).join(' | ');
    default:
      throw new Error(`Unsupported type ${type.type}`);
  }
}

function getTypes(bindings) {
  return bindings.map((bind) => `${bind.name}: ${getType(bind.bindingType)}`);
}

/**
 * @type {import('tscm/macro').Macro}
 */
module.exports.scrap = function scrap({ node }) {
  const string = getString(node.arguments[0]);
  const ast = scrapParse(string);

  const interfaces = ast
    .map(
      (node) => `
    interface ${node.name}Data {
      ${getTypes(node.bindings).join(';\n')}
    }
    type ${node.name} = (
      ${getTypes(node.bindings).join(', ')}
    ) => ${node.name}Data;
  `
    )
    .join('\n');
  const names = ast.map((node) => `${node.name}: ${node.name}`).join(', ');
  const code = `(async () => {
    ${interfaces}
    type result = { ${names} };

    const { default: scrap } = await import('@scrap-js/scrap');
    const nodes = scrap([${JSON.stringify(string)}]);

    return nodes as result;
  })()`;

  return babel.parseExpression(code, {
    sourceType: 'module',
    plugins: ['typescript']
  });
};
