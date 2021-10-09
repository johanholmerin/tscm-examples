# typecheck

Partial [typecheck.macro](https://github.com/vedantroy/typecheck.macro) support for [tscm](https://github.com/johanholmerin/tscm). Only supports `createValidator`.

## Example

```typescript
import { createValidator } from 'tscm-examples';

const validate = createValidator!!<{ index: number; name: string }>();

console.log(validate({ index: 0, name: 'some string' }));
```
