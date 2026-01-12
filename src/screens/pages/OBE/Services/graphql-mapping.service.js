import { authHeader, handleResponse } from '@/_services/api';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_URL || '/graphql';

export const GraphQLMappingService = {
  getCoPoMappingsByProgram,
};

/**
 * Get CO-PO mappings by program
 * GraphQL Query: coPoMappingsByProgram
 */
function getCoPoMappingsByProgram(programId, subjectId = null, page = 0, size = 100) {
  const query = `
    query GetCoPoMappings($programId: ID!, $subjectId: ID, $page: Int, $size: Int) {
      coPoMappingsByProgram(programId: $programId, subjectId: $subjectId, page: $page, size: $size) {
        totalElements
        totalPages
        content {
          coPoMappingId
          correlationLevel
          averageCorrelation
          subject {
            subjectId
            name
            subjectCode
          }
          co {
            coId
            coCode
            description
          }
          po {
            poId
            poCode
            description
          }
          pso {
            psoId
            psoCode
            description
          }
          bloomsLevels {
            bloomsLevelId
            levelName
          }
        }
      }
    }
  `;

  const variables = {
    programId: String(programId),
    subjectId: subjectId ? String(subjectId) : null,
    page,
    size,
  };

  return fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      ...authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
    .then(handleResponse)
    .then(response => {
      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'GraphQL Error');
      }
      return response.data?.coPoMappingsByProgram;
    });
}
