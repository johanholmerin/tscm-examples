import { createValidator } from 'tscm-examples';

const validate = createValidator!!<{ index: number; name: string }>();

console.log(validate({ index: 0, name: 'some string' }));
