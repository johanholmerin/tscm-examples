const babel = require('@babel/parser');
const generator = require('@babel/generator').default;
const {
  getTypeParameter,
  throwUnexpectedError,
  getArgs
} = require('typecheck.macro/dist/macro-assertions');
const {
  getTypeParameterIR
} = require('typecheck.macro/dist/type-ir/astToTypeIR');
// const {
//   flatten: flattenType
// } = require('typecheck.macro/dist/type-ir/passes/flatten');
const instantiateIR =
  require('typecheck.macro/dist/type-ir/passes/instantiate').default;
const cleanUnions =
  require('typecheck.macro/dist/type-ir/passes/clean').default;
const solveIntersections =
  require('typecheck.macro/dist/type-ir/passes/intersect').default;
const generateValidator =
  require('typecheck.macro/dist/code-gen/irToInline').default;

function finalizeType(path, instantiatedTypes, namedTypes) {
  const typeParam = getTypeParameter(path);
  const ir = getTypeParameterIR(typeParam.node);
  const state = {
    instantiatedTypes,
    namedTypes,
    typeStats: new Map(),
    newInstantiatedTypes: []
  }; // no type resolution on the type parameter

  // XXX errors for some reason, seems to work without it
  // ir = flattenType(ir);
  const instantiatedIR = instantiateIR(ir, state);

  for (const type of state.newInstantiatedTypes) {
    const newType = instantiatedTypes.get(type);

    if (newType === undefined) {
      throwUnexpectedError(`did not expected ${type} to be undefined`);
    }

    newType.value = cleanUnions(
      solveIntersections(newType.value, instantiatedTypes),
      instantiatedTypes
    );
    instantiatedTypes.set(type, newType);
  }

  const finalIR = cleanUnions(
    solveIntersections(instantiatedIR, instantiatedTypes),
    instantiatedTypes
  );
  return [finalIR, state.typeStats];
}

/**
 * @type {import('tscm/macro').Macro}
 */
module.exports.createValidator = function createValidator({ node, fileName }) {
  //
  // Re-serialize and parse to get a NodePath
  //

  const { code: programCode } = generator(node);
  const { default: traverse } = require('@babel/traverse');
  let path;
  const ast = babel.parse(programCode, {
    sourceType: 'module',
    plugins: ['typescript']
  });
  traverse(ast, {
    Program(programPath) {
      path = programPath.get('body.0.expression.callee');
    }
  });
  const instantiatedTypes = new Map();
  const namedTypes = new Map();
  const fileText = '';

  //
  // From typecheck.macro macroHandler
  //

  const [finalIR, typeStats] = finalizeType(
    path,
    instantiatedTypes,
    namedTypes
  );
  const [
    { circularRefs, allowForeignKeys, expectedValueFormat },
    userFunctions
  ] = getArgs(
    'boolean',
    path,
    "typecheck.macro's default export",
    fileText,
    fileName
  );
  const code = generateValidator(finalIR, {
    instantiatedTypes,
    options: {
      errorMessages: false,
      expectedValueFormat,
      circularRefs,
      allowForeignKeys,
      userFunctions
    },
    typeStats
  });

  return babel.parse(`(${code}) as (input: any) => boolean`, {
    sourceType: 'module',
    plugins: ['typescript']
  });
};
