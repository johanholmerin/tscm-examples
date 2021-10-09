# const-json

Adds support for importing JSON `as const`, solving [TypeScript#32063](https://github.com/microsoft/TypeScript/issues/32063)

## Example

```typescript
import { const_json } from 'tscm-examples';

const someFile = const_json!!('./some_file.json');
```
