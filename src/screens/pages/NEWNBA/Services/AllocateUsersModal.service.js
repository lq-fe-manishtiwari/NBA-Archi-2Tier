// src/screens/pages/NEWNBA/Services/AllocateUsersModal.service.js

import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

const GRAPHQL_URL = "/graphql";

/* ---------------- GRAPHQL QUERY ---------------- */
const GET_CONTRIBUTORS = `
  query {
    getContributors {
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
    const res = await graphQLRequest(GET_CONTRIBUTORS);
    return res?.getContributors || [];
  },

  allocateUsers: async (payload) => {
    return apiNBARequest(`/nba/criteria-allocation/assign`, {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  getAllocateUsers: async (cycleSubCategoryId) => {
    const url = `/nba/criteria-allocation/sub-category/${cycleSubCategoryId}/assignees`;
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


  getAllocateSectionForContributor: async (contributorId) => {
    const url = `/nba/criteria-allocation/contributor/${contributorId}`;
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

  getMyTasksWithStatus: async (contributorId) => {
    const url = `/nba/criteria-allocation/my-tasks-with-status/${contributorId}`;
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
      console.error("Error fetching my tasks with status:", error);
      throw error;
    }
  },

  deAllocateContributor: async (allocationId) => {
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
        `Error de-allocating contributor ${contributorId} from cycleSubCategory ${cycleSubCategoryId}:`,
        error
      );
      throw error;
    }
  },
  //   getAllocateUsersSubCoordinator: async (cycleCategoryId) => {
  //   const url = `/nba/criteria-allocation/category/${cycleCategoryId}/sub-coordinators`;
  //   try {
  //     const response = await apiNBARequest(url, {
  //       method: "GET",
  //       headers: {
  //         ...authHeader(),
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     return handleResponse(response);
  //   } catch (error) {
  //     console.error("Error fetching allocated users:", error);
  //     throw error;
  //   }
  // },
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
};
