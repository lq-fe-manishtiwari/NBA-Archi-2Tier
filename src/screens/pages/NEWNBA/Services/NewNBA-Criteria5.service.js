// src/Services/NewNBA-Criteria5.service.js

import { apiNBARequest, authHeader, authHeaderToPost, handleResponse } from '@/_services/api';

export const newnbaCriteria5Service = {

  //5.A
  getCriteria5_A_Data,
  saveCriteria5_A_Data,
  deleteCriteria5_AData,
  getallCardDetails5_A,
  updateCriteria5_A_Data,
  updateCriteria5_A_ApprovalStatus,
  getPrequalifierdatain5_A,

// 5.1 Student-Faculty Ratio

  getCriteria5_1_Data,
  saveCriteria5_1_Data,
  deleteCriteria5_1Data,
  getallCardDetails,
  updateCriteria5_1_Data,
  updateCriteria5_1_ApprovalStatus,


  //5.2Faculty Qualification
  getCriteria5_2_Data,
  saveCriteria5_2_Data,
  deleteCriteria5_2Data,
  getallCardDetails5_2Data,  
  updateCriteria5_2_Data,
  updateCriteria5_2_ApprovalStatus,

  //5.3 Faculty Cadre Proportion
  getCriteria5_3_Data,
  saveCriteria5_3_Data,
  deleteCriteria5_3Data,
  getallCardDetails5_3Data,  
  updateCriteria5_3_Data,
  updateCriteria5_3_ApprovalStatus,

  //5.4 Visiting/Adjunct Faculty
  getCriteria5_4_Data,
  saveCriteria5_4_Data,
  deleteCriteria5_4Data,
  getallCardDetails5_4Data,  
  updateCriteria5_4_Data,
  updateCriteria5_4_ApprovalStatus,

   //5.5 Faculty Retention
  getCriteria5_5_Data,
  saveCriteria5_5_Data,
  deleteCriteria5_5Data,
  getallCardDetails5_5Data,  
  updateCriteria5_5_Data,
  updateCriteria5_5_ApprovalStatus,
};

function getCriteria5_A_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/5A/faculty-information/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function saveCriteria5_A_Data(values, currentUserStaffId) {
  const url = `/admin/nba/5A/faculty-information?currentUserId=${currentUserStaffId}`;
  
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getallCardDetails5_A(cycleSubCategoryId) {
  const url = `/admin/nba/5A/faculty-information/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria5_A_Data(id, values) {
  const url = `/admin/nba/5A/faculty-information/${id}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function updateCriteria5_A_ApprovalStatus(approverId, approvalData) {
  const url = `/admin/nba/5A/faculty-information/approval-status?approverId=${approverId}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(approvalData),
  }).then(handleResponse);
}

function deleteCriteria5_AData(Id) {
  const url = `/admin/nba/5A/faculty-information/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function getPrequalifierdatain5_A(cycleId,collegeId,programId) {
  // https://nba-dev-api.learnqoch.com:8443/api/admin/nba/part-a/15/faculty-details?collegeId=1&programId=51
  const url = `/admin/nba/part-a/${cycleId}/faculty-details?collegeId=${collegeId}&programId=${programId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

// ====================
// Criteria 5.1 Functions - Student-Faculty Ratio-------------------------------------------------------------
// ====================



function getCriteria5_1_Data(cycleSubCategoryId, otherStaffId) {
    // GET /api/admin/nba/5.1/student-faculty-ratio/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
   const url = `/admin/nba/5.1/student-faculty-ratio/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function saveCriteria5_1_Data(values, currentUserStaffId) {
  // POST /api/admin/nba/5.1/student-faculty-ratio
  const url = `/admin/nba/5.1/student-faculty-ratio?currentUserId=${currentUserStaffId}`;
  
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getallCardDetails(cycleSubCategoryId) {
    // GET /api/admin/nba/5.1/student-faculty-ratio/cycle-subcategory/{cycleSubCategoryId}/contributors
  const url = `/admin/nba/5.1/student-faculty-ratio/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria5_1_Data(id, values) {
  const url = `/admin/nba/5.1/student-faculty-ratio/${id}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}


function updateCriteria5_1_ApprovalStatus(approverId, approvalData) {
  const url = `/admin/nba/5.1/student-faculty-ratio/approval-status?approverId=${approverId}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(approvalData),
  }).then(handleResponse);
}

function deleteCriteria5_1Data(Id) {
// DELETE  /api/admin/nba/5.1/student-faculty-ratio/{id}
  const url = `/admin/nba/5.1/student-faculty-ratio/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

// ====================
// Criteria 5.2 Functions - Faculty Qualification-------------------------------------------------------------
// ====================

function getCriteria5_2_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/5.2/faculty-qualification-index/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get all contributor entries for a cycle (for card view)
 * GET /api/admin/nba/5.2/faculty-qualification-index/cycle-subcategory/{cycle_subcategory_id}/contributors
 */
function getallCardDetails5_2Data(cycleSubCategoryId) {
  const url = `/admin/nba/5.2/faculty-qualification-index/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Create new Faculty Qualification Index entry
 * POST /api/admin/nba/5.2/faculty-qualification-index/
 * @param {Object} values - Request body in snake_case format
 */
function saveCriteria5_2_Data(values) {
  const url = `/admin/nba/5.2/faculty-qualification-index`;
  
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * Update existing Faculty Qualification Index entry
 * PUT /api/admin/nba/5.2/faculty-qualification-index/{id}
 * @param {number} id - FQI entry ID
 * @param {Object} values - Request body in snake_case format
 */
function updateCriteria5_2_Data(id, values) {
  const url = `/admin/nba/5.2/faculty-qualification-index/${id}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * Update approval status of an FQI entry
 * PUT /api/admin/nba/5.2/faculty-qualification-index/approval-status?approverId={approverId}
 * @param {number} approverId - ID of the approver/reviewer
 * @param {Object} approvalData - { record_id, approval_status, rejection_reason }
 */
function updateCriteria5_2_ApprovalStatus(approverId, approvalData) {
  const url = `/admin/nba/5.2/faculty-qualification-index/approval-status?approverId=${approverId}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(approvalData),
  }).then(handleResponse);
}

/**
 * Delete Faculty Qualification Index entry
 * DELETE /api/admin/nba/5.2/faculty-qualification-index/{id}
 * @param {number} id - FQI entry ID
 */
function deleteCriteria5_2Data(id) {
  const url = `/admin/nba/5.2/faculty-qualification-index/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

// ====================
// Criteria 5.3 Functions - Faculty Cadre Proportion
// ====================

/**
 * Get Faculty Cadre Proportion entries for specific cycle and staff
 * GET /api/admin/nba/5.3/faculty-cadre-proportion/cycle-subcategory/{cycle_subcategory_id}/staff/{other_staff_id}
 */
function getCriteria5_3_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/5.3/faculty-cadre-proportion/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get all contributor entries for a cycle
 * GET /api/admin/nba/5.3/faculty-cadre-proportion/cycle-subcategory/{cycle_subcategory_id}/contributors
 */
function getallCardDetails5_3Data(cycleSubCategoryId) {
  const url = `/admin/nba/5.3/faculty-cadre-proportion/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Create new Faculty Cadre Proportion entry
 * POST /api/admin/nba/5.3/faculty-cadre-proportion
 * @param {Object} values - Request body in snake_case format
 */
function saveCriteria5_3_Data(values) {
  const url = `/admin/nba/5.3/faculty-cadre-proportion`;
  
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * Update existing Faculty Cadre Proportion entry
 * PUT /api/admin/nba/5.3/faculty-cadre-proportion/{id}
 * @param {number} id - Cadre Proportion entry ID
 * @param {Object} values - Request body in snake_case format
 */
function updateCriteria5_3_Data(id, values) {
  const url = `/admin/nba/5.3/faculty-cadre-proportion/${id}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * Update approval status of a Cadre Proportion entry
 * PUT /api/admin/nba/5.3/faculty-cadre-proportion/approval-status?approverId={approverId}
 * @param {number} approverId - ID of the approver/reviewer
 * @param {Object} approvalData - { record_id, approval_status, rejection_reason }
 */
function updateCriteria5_3_ApprovalStatus(approverId, approvalData) {
  const url = `/admin/nba/5.3/faculty-cadre-proportion/approval-status?approverId=${approverId}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(approvalData),
  }).then(handleResponse);
}

/**
 * Delete Faculty Cadre Proportion entry
 * DELETE /api/admin/nba/5.3/faculty-cadre-proportion/{id}
 * @param {number} id - Cadre Proportion entry ID
 */
function deleteCriteria5_3Data(id) {
  const url = `/admin/nba/5.3/faculty-cadre-proportion/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

// ====================
// Criteria 5.4 Functions - Visiting/Adjunct Faculty------------------------------------------------------------------
// ====================

/**
 * Get Visiting/Adjunct Faculty entries for specific cycle and staff
 * GET /api/admin/nba/5.4/visiting-adjunct-faculty/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
 */
function getCriteria5_4_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/5.4/visiting-adjunct-faculty/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get all contributor entries for a cycle
 * GET /api/admin/nba/5.4/visiting-adjunct-faculty/cycle-subcategory/{cycleSubCategoryId}/contributors
 */
function getallCardDetails5_4Data(cycleSubCategoryId) {
  const url = `/admin/nba/5.4/visiting-adjunct-faculty/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Create new Visiting/Adjunct Faculty entry
 * POST /api/admin/nba/5.4/visiting-adjunct-faculty
 * @param {Object} values - Request body in snake_case format
 */
function saveCriteria5_4_Data(values) {
  const url = `/admin/nba/5.4/visiting-adjunct-faculty`;
  
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * Update existing Visiting/Adjunct Faculty entry
 * PUT /api/admin/nba/5.4/visiting-adjunct-faculty/{id}
 * @param {number} id - Visiting Faculty entry ID
 * @param {Object} values - Request body in snake_case format
 */
function updateCriteria5_4_Data(id, values) {
  const url = `/admin/nba/5.4/visiting-adjunct-faculty/${id}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * Update approval status of a Visiting Faculty entry
 * PUT /api/admin/nba/5.4/visiting-adjunct-faculty/approval-status?approverId={approverId}
 * @param {number} approverId - ID of the approver/reviewer
 * @param {Object} approvalData - { recordId, approval_status, rejection_reason }
 */
function updateCriteria5_4_ApprovalStatus(approverId, approvalData) {
  const url = `/admin/nba/5.4/visiting-adjunct-faculty/approval-status?approverId=${approverId}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(approvalData),
  }).then(handleResponse);
}

/**
 * Delete Visiting/Adjunct Faculty entry
 * DELETE /api/admin/nba/5.4/visiting-adjunct-faculty/{id}
 * @param {number} id - Visiting Faculty entry ID
 */
function deleteCriteria5_4Data(id) {
  const url = `/admin/nba/5.4/visiting-adjunct-faculty/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}



 //5.5 Faculty Retention----------------------------------------------------------------------------------

function getCriteria5_5_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/5.5/faculty-retention/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get all contributor entries for a cycle
 * GET /api/admin/nba/5.5/faculty-retention/cycle-subcategory/{cycleSubCategoryId}/contributors
 */
function getallCardDetails5_5Data(cycleSubCategoryId) {
  const url = `/admin/nba/5.5/faculty-retention/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Create new Faculty Retention entry
 * POST /api/admin/nba/5.5/faculty-retention
 * @param {Object} values - Request body in snake_case format
 */
function saveCriteria5_5_Data(values) {
  const url = `/admin/nba/5.5/faculty-retention`;
  
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * Update existing Faculty Retention entry
 * PUT /api/admin/nba/5.5/faculty-retention/{id}
 * @param {number} id - Faculty Retention entry ID
 * @param {Object} values - Request body in snake_case format
 */
function updateCriteria5_5_Data(id, values) {
  const url = `/admin/nba/5.5/faculty-retention/${id}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * Update approval status of a Faculty Retention entry
 * PUT /api/admin/nba/5.5/faculty-retention/approval-status?approverId={approverId}
 * @param {number} approverId - ID of the approver/reviewer
 * @param {Object} approvalData - { recordId, approval_status, rejection_reason }
 */
function updateCriteria5_5_ApprovalStatus(approverId, approvalData) {
  const url = `/admin/nba/5.5/faculty-retention/approval-status?approverId=${approverId}`;
  
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(approvalData),
  }).then(handleResponse);
}

/**
 * Delete Faculty Retention entry
 * DELETE /api/admin/nba/5.5/faculty-retention/{id}
 * @param {number} id - Faculty Retention entry ID
 */
function deleteCriteria5_5Data(id) {
  const url = `/admin/nba/5.5/faculty-retention/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}