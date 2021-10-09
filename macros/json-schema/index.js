const path = require('path');
const fs = require('fs');
const t = require('@babel/types');
const babel = require('@babel/parser');
const { validate } = require('json-schema-to-typescript/dist/src/validator');
const { link } = require('json-schema-to-typescript/dist/src/linker');
const { normalize } = require('json-schema-to-typescript/dist/src/normalizer');
const { parse } = require('json-schema-to-typescript/dist/src/parser');
const { optimize } = require('json-schema-to-typescript/dist/src/optimizer');
const { generate } = require('json-schema-to-typescript/dist/src/generator');

const DEFAULT_OPTIONS = {
  $refOptions: {},
  cwd: process.cwd(),
  declareExternallyReferenced: true,
  enableConstEnums: true,
  format: true,
  ignoreMinAndMaxItems: false,
  strictIndexSignatures: false,
  unreachableDefinitions: false,
  unknownAny: true
};

/**
 * @type {import('tscm/macro').Macro}
 */
module.exports.json_schema = function json_schema({ node, fileName }) {
  const pathStringLiteral = node.arguments[0];
  t.assertStringLiteral(pathStringLiteral);
  const filePath = pathStringLiteral.value;

  const schemaString = fs.readFileSync(
    path.join(path.parse(fileName).dir, filePath),
    'utf8'
  );
  const schema = JSON.parse(schemaString);

  // logic from `compile`, without async dereference and prettier formatting
  const errors = validate(schema, filePath);
  if (errors.length) {
    throw new Error(errors[0]);
  }
  const linked = link(schema);
  const normalized = normalize(linked, filePath, DEFAULT_OPTIONS);
  const parsed = parse(normalized, DEFAULT_OPTIONS);
  const optimized = optimize(parsed);
  const generated = generate(optimized, DEFAULT_OPTIONS).slice('export'.length);

  const code = `(() => {
${generated}
interface Validator<T> {
  (value: unknown): value is T;
  readonly TYPE: T;
}
const Ajv = require('ajv');
const ajv = new Ajv();
const validator: Validator<${parsed.standaloneName}> = ajv.compile(${schemaString});
return validator;
})()`;

  return babel.parse(code, {
    sourceType: 'module',
    plugins: ['typescript']
  });
};
