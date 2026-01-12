/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
  AcademicAPI,
} from '@/_services/api';

export const newnbaCriteria1Service = {

  // newnba apis
  saveCriteria1_1_Data,
  getCriteria1_1_Data,
  deleteCriteria1_1Data,
  putCriteria1_1_Data,
  getAllCriteria1_1_Data,
  updateCardStatus,
  getallCardDetails,
  
  // Criteria 1.2 APIs
  saveCriteria1_2_Data,
  getCriteria1_2_Data,
  deleteCriteria1_2_Data,
  putCriteria1_2_Data,
  getAllCriteria1_2_Data,
  updateCriteria1_2_Status,
  
  // Criteria 1.3 APIs
  saveCriteria1_3_Data,
  getCriteria1_3_Data,
  deleteCriteria1_3_Data,
  putCriteria1_3_Data,
  getAllCriteria1_3_Data,
  updateCriteria1_3_Status,
  getCoPoMappingsByProgram,
  getCoPoMappingsByProgramREST,
  getCourseOutcomesByProgram,
  
  // Criteria 1.4 APIs
  saveCriteria1_4_Data,
  getCriteria1_4_Data,
  deleteCriteria1_4_Data,
  putCriteria1_4_Data,
  getAllCriteria1_4_Data,
  updateCriteria1_4_Status,
  
  // Criteria 1.5 APIs
  saveCriteria1_5_Data,
  getCriteria1_5_Data,
  deleteCriteria1_5_Data,
  putCriteria1_5_Data,
  getAllCriteria1_5_Data,
  updateCriteria1_5_Status,

  //MarkObtained
    saveMoMarks,
    getMoMarks,
    putMoMarks
};

function getAllCriteria1_1_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.1/vision-mission-peo/cycle-subcategory/${cycleSubCategoryId}/all`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus(requestPayload, approverId) {
  // Transform payload to match Criteria 1.1 backend expectations
  const payload = {
    approval_status: requestPayload.approval_status,
     vision_mission_peo_id: requestPayload.id,
    rejection_reason: requestPayload.rejection_reason,
    // approved_by: requestPayload.approved_by,
    // approved_by_name: requestPayload.approved_by_name
  };
  
  const approverIdParam = approverId || requestPayload.approved_by;
  return apiNBARequest(`/admin/nba/1.1/vision-mission-peo/approval-status?approverStaffId=${approverIdParam}`, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria1_1_Data(currentUserStaffId,values) {
  const url = `/admin/nba/1.1/vision-mission-peo?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_1_Data(cycleSubCategoryId, otherStaffId) {
  // /api/admin/nba/1.1/vision-mission-peo/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId
   const url = `/admin/nba/1.1/vision-mission-peo/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails(cycleSubCategoryId) {
  const url = `/admin/nba/1.1/vision-mission-peo/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Delete Criteria 1.1 data
 *
 * @param {string | number} Id
 */
function deleteCriteria1_1Data(Id) {
  const url = `/admin/nba/1.1/vision-mission-peo/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}


function putCriteria1_1_Data(id,currentUserStaffId,values) {
  // api/admin/nba/1.1/vision-mission-peo/45?currentUserStaffId=123
  const url = `/admin/nba/1.1/vision-mission-peo/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

// Criteria 1.2 Functions
function saveCriteria1_2_Data(otherStaffId, values) {
  const payload = {
    other_staff_id: otherStaffId,
    ...values
  };
  const url = `/admin/nba/1.2/curriculum-structure`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function getCriteria1_2_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.2/curriculum-structure/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function deleteCriteria1_2_Data(id) {
  const url = `/admin/nba/1.2/curriculum-structure/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria1_2_Data(id, values) {
  const url = `/admin/nba/1.2/curriculum-structure/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getAllCriteria1_2_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.2/curriculum-structure/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria1_2_Status(approverId, statusPayload) {
  const url = `/admin/nba/1.2/curriculum-structure/approval-status?approverId=${approverId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(statusPayload),
  }).then(handleResponse);
}

// Criteria 1.3 Functions
function saveCriteria1_3_Data(currentUserStaffId, values) {
  const url = `/admin/nba/1.3/po-pso-mapping-courses?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_3_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.3/po-pso-mapping-courses/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function deleteCriteria1_3_Data(id) {
  const url = `/admin/nba/1.3/po-pso-mapping-courses/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria1_3_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/1.3/po-pso-mapping-courses/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getAllCriteria1_3_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.3/po-pso-mapping-courses/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria1_3_Status(approverStaffId, statusPayload) {
  // Transform payload to use po_pso_mapping_id for API
  const transformedPayload = {
    po_pso_id: statusPayload.po_pso_id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason
  };
  
  const url = `/admin/nba/1.3/po-pso-mapping-courses/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(transformedPayload),
  }).then(handleResponse);
}

function getCoPoMappingsByProgramREST(programId) {
  const url = `/obe/co-po-mapping/program/${programId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getCourseOutcomesByProgram(programId) {
  const url = `/obe/program/${programId}/course-outcomes`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

async function getCoPoMappingsByProgram(programId, subjectId = null, page = 0, size = 1000) {
  const graphqlQuery = {
    query: `
      query CoPoMappingsByProgram($programId: ID!, $subjectId: ID, $page: Int, $size: Int) {
        coPoMappingsByProgram(programId: $programId, subjectId: $subjectId, page: $page, size: $size) {
          content {
            coPoMappingId
            correlationLevel
            averageCorrelation
            co {
              coId
              coCode
              coStatement
            }
            po {
              poId
              poCode
              poStatement
            }
            pso {
              psoId
              psoCode
              psoStatement
            }
            subject {
              subjectId
              subjectCode
              name
            }
          }
          totalElements
          totalPages
        }
      }
    `,
    variables: { 
      programId: String(programId),
      subjectId: subjectId ? String(subjectId) : null,
      page,
      size
    },
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
    return result.data.coPoMappingsByProgram;
  } catch (error) {
    console.error("GraphQL error:", error);
    throw error;
  }
}

// Criteria 1.4 Functions
function saveCriteria1_4_Data(values) {
  const url = `/admin/nba/1.4/course-outcome-matrix`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_4_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.4/course-outcome-matrix/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function deleteCriteria1_4_Data(id) {
  const url = `/admin/nba/1.4/course-outcome-matrix/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria1_4_Data(id, values) {
  const url = `/admin/nba/1.4/course-outcome-matrix/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getAllCriteria1_4_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.4/course-outcome-matrix/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria1_4_Status(approverId, statusPayload) {
  const url = `/admin/nba/1.4/course-outcome-matrix/approval-status?approverId=${approverId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(statusPayload),
  }).then(handleResponse);
}

// Criteria 1.5 Functions
function saveCriteria1_5_Data(values) {
  const url = `/admin/nba/1.5/program-articulation-matrix`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_5_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.5/program-articulation-matrix/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function deleteCriteria1_5_Data(id) {
  const url = `/admin/nba/1.5/program-articulation-matrix/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria1_5_Data(id, values) {
  const url = `/admin/nba/1.5/program-articulation-matrix/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getAllCriteria1_5_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.5/program-articulation-matrix/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria1_5_Status(approverId, statusPayload) {
  const url = `/admin/nba/1.5/program-articulation-matrix/approval-status?approverId=${approverId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(statusPayload),
  }).then(handleResponse);
}

//////// mark obtained

function getMoMarks(cycleSubCategoryId) {
  const url = `/nba-evaluation-marks/by-sub-category/${cycleSubCategoryId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function saveMoMarks(values) {
  const url = `/nba-evaluation-marks`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function putMoMarks(id, values) {
  const url = `/nba-evaluation-marks/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}


