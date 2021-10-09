const { ProcessingMode } = require('@pgtyped/cli/lib');
const { queryToTypeDeclarations } = require('@pgtyped/cli/lib/generator');
const { TypeAllocator, DefaultTypeMapping } = require('@pgtyped/cli/lib/types');
const parseDatabaseUrl = require('ts-parse-database-url').default;
const { AsyncQueue, startup } = require('@pgtyped/query');
const parseQuery =
  require('@pgtyped/query/lib/loader/typescript/query').default;

function convertParsedURLToDBConfig({ host, password, user, port, database }) {
  return {
    host,
    password,
    user,
    port,
    dbName: database
  };
}

async function generate({ query, dbUrl }) {
  const queryAST = parseQuery(query, 'Query').query;
  const types = new TypeAllocator(DefaultTypeMapping);
  const dbConfig = convertParsedURLToDBConfig(parseDatabaseUrl(dbUrl));
  const config = { db: dbConfig };

  const connection = new AsyncQueue();

  try {
    await startup(config.db, connection);

    return await queryToTypeDeclarations(
      { ast: queryAST, mode: ProcessingMode.TS },
      connection,
      types,
      config
    );
  } finally {
    connection?.socket?.destroy();
  }
}

module.exports = { generate };
