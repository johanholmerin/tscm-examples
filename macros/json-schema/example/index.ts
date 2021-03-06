import { json_schema, TypeOf } from 'tscm-examples';

const validator = json_schema!!('./json-schema.json');

const obj: TypeOf<typeof validator> = {
  firstName: 'first',
  lastName: 'last',
  age: 99,
  hairColor: 'brown'
};

const something: unknown = {
  firstName: 11
};

if (validator(something)) {
  const safeLastName: string = something.lastName;
  console.log('safely accessed lastName', safeLastName);
}

console.log(validator(obj));
console.log(validator(something));
