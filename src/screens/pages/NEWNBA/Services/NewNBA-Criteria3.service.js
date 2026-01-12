/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
  AcademicAPI,
} from '@/_services/api';

export const newnbaCriteria3Service = {

  // newnba apis
  saveCriteria3_1_Data,
  getCriteria3_1_Data,
  deleteCriteria3_1Data,
  putCriteria3_1_Data,
  getAllCriteria3_1_Data,
  updateCardStatus,
  getallCardDetails,
  
  // Criteria 3.7 APIs
  saveCriteria3_7_Data,
  getCriteria3_7_Data,
  deleteCriteria3_7_Data,
  putCriteria3_7_Data,
  getallCardDetails3_7,
  getAllCriteria3_7_Data,
  updateCriteria3_7_Status,
  
  // Criteria 3.8 APIs
  saveCriteria3_8_Data,
  getCriteria3_8_Data,
  deleteCriteria3_8_Data,
  putCriteria3_8_Data,
  getallCardDetails3_8,
  updateCriteria3_8_Status,
};

function getAllCriteria3_1_Data(cycleSubCategoryId) {
  const url = `/admin/nba/2.1/teaching-learning-quality/cycle-subcategory/${cycleSubCategoryId}/all`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus(statusPayload, currentUserStaffId) {
  // Ensure payload has correct format for Criteria 3.1
  const payload = {
    teaching_learning_quality_id: statusPayload.teaching_learning_quality_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/2.1/teaching-learning-quality/approval-status?approverId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria3_1_Data(currentUserStaffId,values) {
  const url = `/admin/nba/2.1/teaching-learning-quality?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria3_1_Data(cycleSubCategoryId, otherStaffId) {
  // /api/admin/nba/2.1/teaching-learning-quality/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId
   const url = `/admin/nba/2.1/teaching-learning-quality/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails(cycleSubCategoryId) {
  const url = `/admin/nba/2.1/teaching-learning-quality/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Delete Criteria 3.1 data
 *
 * @param {string | number} Id
 */
function deleteCriteria3_1Data(Id) {
  const url = `/admin/nba/2.1/teaching-learning-quality/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}


function putCriteria3_1_Data(id,currentUserStaffId,values) {
  // api/admin/nba/2.1/teaching-learning-quality/45?currentUserStaffId=123
  const url = `/admin/nba/2.1/teaching-learning-quality/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

// ============ CRITERIA 3.7 APIs ============

function saveCriteria3_7_Data(values) {
  const url = `/admin/nba/3.7/attainment-course-outcomes`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria3_7_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/3.7/attainment-course-outcomes/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getAllCriteria3_7_Data(cycleSubCategoryId) {
  const url = `/admin/nba/3.7/attainment-course-outcomes/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria3_7_Data(id, values) {
  const url = `/admin/nba/3.7/attainment-course-outcomes/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function deleteCriteria3_7_Data(id) {
  const url = `/admin/nba/3.7/attainment-course-outcomes/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria3_7_Status(statusPayload, approverId) {
  // Ensure payload has correct format for Criteria 3.7
  const payload = {
    attainment_co_id: statusPayload.attainment_co_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/3.7/attainment-course-outcomes/approval-status?approverId=${approverId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function getallCardDetails3_7(cycleSubCategoryId) {
  const url = `/admin/nba/3.7/attainment-course-outcomes/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

// ============ CRITERIA 3.8 APIs ============

function saveCriteria3_8_Data(values) {
  const url = `/admin/nba/3.8/attainment-program-outcomes`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria3_8_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/3.8/attainment-program-outcomes/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria3_8_Data(id, values) {
  const url = `/admin/nba/3.8/attainment-program-outcomes/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function deleteCriteria3_8_Data(id) {
  const url = `/admin/nba/3.8/attainment-program-outcomes/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria3_8_Status(statusPayload, approverId) {
  // Ensure payload has correct format for Criteria 3.8
  const payload = {
    attainment_po_id: statusPayload.attainment_po_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/3.8/attainment-program-outcomes/approval-status?approverId=${approverId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function getallCardDetails3_8(cycleSubCategoryId) {
  const url = `/admin/nba/3.8/attainment-program-outcomes/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}