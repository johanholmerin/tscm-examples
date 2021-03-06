# pgtyped

Type-safe Postgres queries in TypeScript using [pgtyped](https://github.com/adelsz/pgtyped).

https://user-images.githubusercontent.com/7433263/150874144-6a3e663b-52db-4c5e-ad7d-6a37946bf8f0.mp4

## Example

### Config

Postgres connection URL must be provided using environment variable `DATABASE_URL`, or by setting it in a `.env` file.

```sh
DATABASE_URL=postgres://postgres:somepassword@localhost:5432/todos
```

```typescript
import type { Client } from 'pg';
import { sql } from 'tscm-examples';

const LIST_TODOS_QUERY = sql!!(`
  SELECT id, description, done
  FROM todos
  WHERE done = $done
  ORDER BY id;
`);

export function listDoneTodos(client: Client) {
  return LIST_TODOS_QUERY.run({ done: true }, client);
}
```
