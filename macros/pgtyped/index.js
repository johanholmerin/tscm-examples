const assert = require('assert');
const dotenv = require('dotenv');
const t = require('@babel/types');
const { doSync } = require('do-sync');
const babel = require('@babel/parser');
const parseQuery =
  require('@pgtyped/query/lib/loader/typescript/query').default;

const generateInterface = doSync((modulePath, query, dbUrl) => {
  const { generate } = require(modulePath);
  return generate({ query, dbUrl });
});

dotenv.config();

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

function generateTS(text) {
  const { DATABASE_URL } = process.env;
  assert(DATABASE_URL, 'Missing environment variable DATABASE_URL');

  const queryAST = parseQuery(text, 'Query').query;
  const interfaces = generateInterface(
    require.resolve('./generate'),
    text,
    DATABASE_URL
  );
  const withoutExports = interfaces.replace(/^export /gm, '');
  const code = `(() => {
${withoutExports}

const { PreparedQuery } = require('@pgtyped/query/lib/tag');

const query = new PreparedQuery(${JSON.stringify(queryAST)});

return query as import('@pgtyped/query/src/tag').PreparedQuery<IQueryParams, IQueryResult>
})()`;

  return babel.parse(code, {
    sourceType: 'module',
    plugins: ['typescript']
  });
}

function generateBabel(text) {
  const queryAST = parseQuery(text, 'Query').query;
  const code = `(() => {
const { PreparedQuery } = require('@pgtyped/query/lib/tag');

const query = new PreparedQuery(${JSON.stringify(queryAST)});

return query
})()`;

  return babel.parse(code, {
    sourceType: 'module'
  });
}

/**
 * @type {import('tscm/macro').Macro}
 */
module.exports.sql = function ({ node, compiler }) {
  const text = getString(node.arguments[0]);

  // Speed up babel compilation by not generating types that won't be used
  if (compiler === 'typescript') {
    return generateTS(text);
  } else {
    return generateBabel(text);
  }
};
