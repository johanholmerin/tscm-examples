# gql

Generates TypeScript interface from GraphQL string

## Example

### Schema

Path to the schema must be provided using the environment variable `GRAPHQL_SCHEMA`, or by setting it in a `.env` file.

```sh
GRAPHQL_SCHEMA=./.graphql
```

```typescript
import { gql } from 'tscm-examples';
import { useQuery } from '@apollo/client';

// query will be a TypedDocumentNode, and can be used with apollo, urql, etc.
const query = gql!!(`
  query GetAuthor($id: String){
    author(id: $id) {
      id
      firstName
      lastName
    }
  }
`);

// data and variables will be typed
const { loading, error, data } = useQuery(query, {
  variables: { id: 'Sarah Connor' }
});
```
