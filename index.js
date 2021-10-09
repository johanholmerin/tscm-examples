module.exports = {
  ...require('./macros/const-json'),
  ...require('./macros/graphql'),
  ...require('./macros/json-schema'),
  ...require('./macros/pgtyped'),
  ...require('./macros/typecheck'),
  ...require('./macros/yaml')
};
