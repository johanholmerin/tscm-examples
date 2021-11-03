# json-schema

Creates validator and TypeScript interface from JSON Schema.

## Example

```typescript
import { json_schema, TypeOf } from 'tscm-examples';

// Validator that takes an unknown input and returns a boolean
const validate = json_schema!!('./json-schema.json');
// Get type from validator
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
