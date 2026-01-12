// src/Services/graphql.service.js
'use client';

import { ApolloClient, InMemoryCache, HttpLink, from, gql } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { authHeader, TeacherLoginAPI } from '@/_services/api';

const GRAPHQL_ENDPOINT = `${TeacherLoginAPI}/graphql`;

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  fetch: (uri, options) => {
    const headers = authHeader();
    options.headers = { ...options.headers, ...headers };
    return fetch(uri, options);
  },
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message }) => console.error(`[GraphQL Error]: ${message}`));
  if (networkError) console.error(`[Network Error]: ${networkError}`);
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only' },
    query: { fetchPolicy: 'network-only' },
  },
});

/* ---------------------------------------------------- */
/*  STUDENT QUERIES  */
/* ---------------------------------------------------- */
export const allStudents = gql`
  query allStudents($page: Int!, $size: Int!) {
    allStudents(page: $page, size: $size) {
      studentId
      firstname
      lastname
      email
      mobile
      gender
      rollNumber
      isActive
    }
  }
`;

export const nonAllocatedStudents = gql`
  query nonAllocatedStudents($programId: ID!) {
    nonAllocatedStudents(programId: $programId) {
      studentId
      firstname
      lastname
      email
      mobile
      gender
      rollNumber
      isActive
      program{
      programName}
    }
  }
`;

export const studentsByAcademicYear = gql`
  query studentsByAcademicYear($academicYearId: ID!) {
    studentsByAcademicYear(academicYearId: $academicYearId) {
      student {
        studentId
        firstname
        lastname
        email
        mobile
        gender
        rollNumber
        isActive
      }
      allocation {
        id
        semesterId
        academicYearId
        academicYear{
        yearNumber
        name
        startDate
        endDate
        batch{
        batchName
        }
        program{
        programName
        programId
        }
        classYear{
        name
        }
        }
        semester{
        name}
        division{
        divisionName
        }
        
      }
    }
  }
`;