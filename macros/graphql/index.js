const assert = require('assert');
const fs = require('fs');
const dotenv = require('dotenv');
const ts = require('typescript');
const babel = require('@babel/parser');
const t = require('@babel/types');
const { buildSchema } = require('graphql');
const { parse } = require('graphql/language');
const { TypeGenVisitor } = require('ts-graphql-plugin/lib/typegen');
const { createOutputSource } = require('ts-graphql-plugin/lib/ts-ast-util');
const {
  mergeAddons
} = require('ts-graphql-plugin/lib/typegen/addon/merge-addons');

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

/**
 * @type {import('tscm/macro').Macro}
 */
module.exports.gql = function gql({ node }) {
  const { GRAPHQL_SCHEMA } = process.env;
  assert(GRAPHQL_SCHEMA, 'Missing environment variable GRAPHQL_SCHEMA');
  const schemaString = fs.readFileSync(GRAPHQL_SCHEMA, 'utf8');
  const schema = buildSchema(schemaString);

  const string = getString(node.arguments[0]);
  const documentNode = parse(string);

  const visitor = new TypeGenVisitor({ schema });
  const outputSource = createOutputSource({ outputFileName: '' });
  const addon = mergeAddons([]);
  const outputSourceFile = visitor.visit(documentNode, {
    outputSource,
    addon
  });
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false
  });
  const content = printer.printFile(outputSourceFile);
  const [data, variables] = content
    .split('export')
    .slice(1)
    .map((str) =>
      str
        .trim()
        .replace(/;$/, '')
        .replace(/^[^=]*=/, '')
    );
  const code =
    `(${JSON.stringify(documentNode)})` +
    ` as unknown` +
    ` as import('@graphql-typed-document-node/core')` +
    `.TypedDocumentNode<${data}, ${variables}>`;

  return babel.parse(code, {
    sourceType: 'module',
    plugins: ['typescript']
  });
};
