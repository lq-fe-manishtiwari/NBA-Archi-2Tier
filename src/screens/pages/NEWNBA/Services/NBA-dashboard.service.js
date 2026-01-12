/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
  authHeaderToFile,
  newapilogin,
  handleFileResponse2
} from "@/_services/api";

export const nbaDashboardService = {

  uploadFile,
  getCategoryNBA,
  getSubCategory,
  getNBAAcademicYear,
  getNBAProgram,
  getNBAReportType,
  saveAccrediatedProgram,
  getAccrediatedProgramByCycleId,
  getSubCriteriasbycycleCriteriaId,
  getAccrediatedProgramByOtherStaffId,
  getAccrediatedProgramByCollegeId,
  getCriteriaByAccrediatedprogramid,
  getCriteriaByAccrediatedprogramidAndSubLevel1,
  getCriteriaByNBACriteriaIDidAndSubLevel1,
  getAllAllocatedListing,
  getAllAllocatedListingContributor,
  getAllocatedGrade,
  getSubCriteriasbyCriteriaId,
  getContributorTasks,
  getSubCoordinatorTasks, 

  getCategory,
  getAllCollegeTypes,


  getPrequalifireReport,

  getCriteriaSummaryForCriterion1,
  getCriteriaSummaryForCriterion,
  getCriteriaSummary,
  getSubCriteriaSummary,
  getCriteriaFilter,
  getCycleCategoriesByCycleId,
  getUserDetails,

  getallocationProgrambyOtherStaffID
};


function getallocationProgrambyOtherStaffID(staffId){
  // /api/admin/academic/program-allocations/staff/{staffId}
    return apiNBARequest(`/admin/academic/program-allocations/staff/${staffId}`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

function getPrequalifireReport(cycleId) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/cron-script/generate/html-pdf/pre-qualifier-report?cycleId=${cycleId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function uploadFile(formData) {
  console.log("nbaDashboardService.uploadFile() sending:", formData.get("file"));

  // Use fetch directly to avoid apiNBARequest adding Content-Type: application/json
  // Let browser set Content-Type: multipart/form-data with boundary automatically
  const headers = authHeaderToFile();

  return fetch(`${newapilogin}/nba/upload`, {
    method: "POST",
    body: formData,  // FormData with binary file
    headers,         // Only auth headers, NO Content-Type
  }).then(handleFileResponse2);
}

function getCategory() {
    return apiNBARequest(`/nba/college-category`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

function getAllCollegeTypes() {
    return apiNBARequest(`/nba/college-type`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

function getContributorTasks(otherStaffId) {
    return apiNBARequest(`/nba/criteria-allocation/my-tasks/${otherStaffId}`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

function getSubCoordinatorTasks(otherStaffId) {
    return apiNBARequest(`/nba/criteria-allocation/my-tasks/${otherStaffId}`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

// --------------------- NBA Service Functions ---------------------

// function getAccrediatedProgramByOtherStaffId(otherStaffId) {
//   return apiNBARequest(`/nba/cycles/${otherStaffId}`, {
//     method: 'GET',
//     headers: authHeader(),
//   }).then(handleResponse);
// }

async function getSubCriteriasbycycleCriteriaId(cycleId, cycleCategoryId) {
  const graphqlQuery = {
    query: `
      query GetCycle($cycleId: ID!) {
        getCycle(id: $cycleId) {
          cycleId
          categories {
            cycleCategoryId
            categoryName
            subCategories {
              cycleSubCategoryId
              subCategoryId
              subCategoryName
              status
              remarks
              score
            }
          }
        }
      }
    `,
    variables: { cycleId: String(cycleId) }, // Ensure cycleId is always a string
  };

  const response = await apiNBARequest("/graphql", {
    method: "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphqlQuery),
  });

  const result = await handleResponse(response);
  const cycle = result.data.getCycle;

  // find the correct category
  const category = cycle.categories.find(
    c => String(c.cycleCategoryId) === String(cycleCategoryId)
  );
  return category ? category.subCategories : [];
}


async function getAccrediatedProgramByCycleId(cycleId) {
  const graphqlQuery = {
    query: `
      query GetAccreditedProgram($cycleId: ID!) {
        getCycle(id: $cycleId) {
          cycleId
          cycleName
          status
          academicYearLabel
          programName
          reportTypeCategoryName
          categories {
            cycleCategoryId
            status
            score
            remarks
            categoryId
            categoryName
            criteriaType
          }
        }
      }
    `,
    variables: { cycleId },
  };

  try {
    const response = await apiNBARequest("/graphql", {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    });

    const result = await handleResponse(response);

    // THIS WAS THE BUG → returning wrong field!
    return result.data.getCycle;  // ← Fixed!

  } catch (error) {
    console.error("GraphQL error:", error);
    throw error;
  }
}

async function getAccrediatedProgramByOtherStaffId(otherStaffId) {
  const graphqlQuery = {
    query: `
      query GetAccreditedProgram($otherStaffId: ID!) {
        getCyclesByStaff(otherStaffId: $otherStaffId) {
          cycleId
          cycleName
          status
          academicYearLabel
          programId
          collegeId
          programName
          reportTypeCategoryName
        }
      }
    `,
    variables: { otherStaffId },
  };

  try {
    const response = await apiNBARequest("/graphql", {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    });

    const result = await handleResponse(response);

    // return actual GraphQL response object
    return result.data.getCyclesByStaff;

  } catch (error) {
    console.error("GraphQL error:", error);
    throw error;
  }
}


async function getAccrediatedProgramByCollegeId(collegeId) {
  const graphqlQuery = {
    query: `
      query GetAccreditedProgram($collegeId: ID!) {
        getCyclesByCollege(collegeId: $collegeId) {
          cycleId
          cycleName
          status
          academicYearLabel
          programId
          collegeId
          programName
          reportTypeCategoryName
        }
      }
    `,
    variables: { collegeId },
  };

  try {
    const response = await apiNBARequest("/graphql", {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    });

    const result = await handleResponse(response);

    // return actual GraphQL response object
    return result.data.getCyclesByCollege;

  } catch (error) {
    console.error("GraphQL error:", error);
    throw error;
  }
}

function getSubCriteriasbyCriteriaId(Id) {
  return apiNBARequest(`/nba/sub-categories?categoryId=${Id}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}


function getCategoryNBA() {
  return apiNBARequest('/nba/categories', {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getSubCategory(categoryId) {
  return apiNBARequest(`/nba/sub-categories?category=${categoryId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getNBAAcademicYear() {
  return apiNBARequest('/nba/academic-years', {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getNBAProgram(subCategoryId) {
  return apiNBARequest(`/nba/sub-categories`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getNBAReportType() {
  return apiNBARequest('/nba/report-type-categories', {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function saveAccrediatedProgram(values) {
  const url = `/nba/cycles`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteriaByAccrediatedprogramid(nbaAccreditedProgramId) {
  return apiNBARequest(`/nba/nba-criteria/accredited-program/${nbaAccreditedProgramId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getCriteriaByAccrediatedprogramidAndSubLevel1(nbaCriteriaId) {
  return apiNBARequest(`/nba/nba-criteria-sub-level1/nba-criteria/${nbaCriteriaId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getCriteriaByNBACriteriaIDidAndSubLevel1(nbaCriteriaId, nbaCriteriaSubLevel1Id) {
  return apiNBARequest(
    `/nba/nba-criteria-sub-level2/nba-criteria/${nbaCriteriaId}/nba-criteria-sub-level1/${nbaCriteriaSubLevel1Id}`,
    {
      method: 'GET',
      headers: authHeader(),
    }
  ).then(handleResponse);
}

function getAllAllocatedListing(schoolUserId) {
  return apiNBARequest(`/nba/contributor-allocation/sub-coordinator/school-user/${schoolUserId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getAllAllocatedListingContributor(schoolUserId) {
  return apiNBARequest(`/nba/contributor-allocation/school-user/${schoolUserId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getAllocatedGrade(staffId) {
  return apiNBARequest(`/admin/academic/program-allocations`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getCriteriaSummaryForCriterion1(cycleSubCategoryId) {
  return apiNBARequest(`/admin/nba/criteria-summary/criterion1/${cycleSubCategoryId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getCycleCategoriesByCycleId(cycleId) {
  return apiNBARequest(`/admin/nba/cycle-categories/${cycleId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

////////////

function getCriteriaSummaryForCriterion(cycleId) {    // cri wise data
  return apiNBARequest(`/admin/nba/criteria-summary/main?cycleId=${cycleId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getCriteriaSummary(cycleSubCatId,cycleId) {  // sub cri data
  return apiNBARequest(`/admin/nba/criteria-summary/outer-by-category?cycleCategoryId=${cycleSubCatId}&criteriaCode=${cycleId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getSubCriteriaSummary(cycleSubCatId,cycleId,sectionCode) {  // sub cri data
  return apiNBARequest(`/admin/nba/criteria-summary/inner?cycleSubCategoryId=${cycleSubCatId}&criteriaCode=${cycleId}&sectionCode=${sectionCode}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getCriteriaFilter(cycleId,status) {  // sub cri data
  return apiNBARequest(`/admin/nba/criteria-summary/main?cycleId=${cycleId}&approvalStatus=${status}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getUserDetails(staffId) { 
  return apiNBARequest(`/admin/nba/criteria-summary/contributions-by-staff?staffId=${staffId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}
