import { useQuery } from '@apollo/client';
import { gql } from 'tscm-examples';

export const query = gql!!(`
  query GetAuthor($id: String){
    author(id: $id) {
      id
      firstName
      lastName
    }
  }
`);

export const { loading, error, data } = useQuery(query, {
  variables: { id: 'Sarah Connor' }
});
