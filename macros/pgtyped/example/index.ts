import type { Client } from 'pg';
import { sql } from 'tscm-examples';

const LIST_TODOS_QUERY = sql!!(`
  SELECT id, description, done
  FROM todos
  WHERE done = $done AND id = $id;
`);

export async function firstDoneId(id: string, client: Client) {
  const [item] = await LIST_TODOS_QUERY.run({ done: true, id }, client);
  return item.id;
}
