# const-json

Creates validator and TypeScript interface from JSON Schema.

## Example

```typescript
import { json_schema } from 'tscm-examples';

// Type for getting type from validator
type TypeOf<T extends { TYPE: unknown }> = T['TYPE'];

// Validator that takes an unknown input and returns a boolean
const validate = json_schema!!('./json-schema.json');
const SchemaType = TypeOf<typeof validate>;

const obj: SchemaType = {
  firstName: 'first',
  lastName: 'last',
  age: 99,
  hairColor: 'brown'
};

if (validate(unsafe_value)) {
  // unsafe_value is now of type SchemaType
}
```
