// src/screens/pages/NEWNBA/Services/AllocateUsersModal.service.js

import { apiNBARequest, authHeader, handleResponse } from "@/_services/api";

const GRAPHQL_URL = "/graphql";

/* ---------------- GRAPHQL QUERY ---------------- */
const GET_Sub_Coordinators = `
  query {
    getSubCoordinators {
      otherStaffId
      firstname
      lastname
      email
    }
  }
`;

/* ------------ GRAPHQL REQUEST WRAPPER ------------ */
async function graphQLRequest(query) {
  const response = await apiNBARequest(GRAPHQL_URL, {
    method: "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  return result.data;
}

/* ------------ EXPORTING SERVICE FUNCTIONS ------------ */
export const allocateUsersModalService = {
  getAllUsers: async () => {
    const res = await graphQLRequest(GET_Sub_Coordinators);
    return res?.getSubCoordinators || [];
  },

  allocateUsers: async (payload) => {
    return apiNBARequest(`/nba/criteria-allocation/assign/category?assignedById=${payload?.assigned_by_id}`, {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  getAllocateUsersSubCoordinator: async (cycleId) => {
    const url = `/nba/criteria-allocation/cycle/${cycleId}/dashboard`;
    try {
      const response = await apiNBARequest(url, {
        method: "GET",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching allocated users:", error);
      throw error;
    }
  },
 

  deAllocateSubCoordinator: async (allocationId) => {
    const url = `/nba/criteria-allocation/delete/${allocationId}`;
    try {
      const response = await apiNBARequest(url, {
        method: "DELETE",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error(
        `Error de-allocating sub-coordinator ${allocationId}:`,
        error
      );
      throw error;
    }
  },
  
};
