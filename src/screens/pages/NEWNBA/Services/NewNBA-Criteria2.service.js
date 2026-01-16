/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
  AcademicAPI,
} from '@/_services/api';

export const newnbaCriteria2Service = {
  // Criteria 2.1 - Program Curriculum
  saveCriteria2_1_Data,
  getCriteria2_1_Data,
  deleteCriteria2_1Data,
  putCriteria2_1_Data,
  getAllCriteria2_1_Data,
  updateCardStatus,
  getallCardDetails,
  
  // Criteria 2.2 - Teaching Learning Process
  saveCriteria2_2_Data,
  getCriteria2_2_Data,
  deleteCriteria2_2Data,
  putCriteria2_2_Data,
  getAllCriteria2_2_Data,
  updateCriteria2_2Status,
};

// ==================== CRITERIA 2.1 - PROGRAM CURRICULUM ====================

/**
 * GET – All Program Curriculum entries (Admin / Coordinator)
 */
function getAllCriteria2_1_Data(cycleSubCategoryId) {
  const url = `/admin/nba/2.1/new-program-curriculum/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * PUT – Update Approval Status
 */
function updateCardStatus(statusPayload, approverStaffId) {
  const payload = {
    id: statusPayload.id,
    approval_status: statusPayload.approval_status, // APPROVED | REJECTED | PENDING
    rejection_reason: statusPayload.rejection_reason || null,
    approved_by: approverStaffId,
    approved_by_name: statusPayload.approved_by_name || '',
  };

  const url = `/admin/nba/2.1/new-program-curriculum/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

/**
 * POST – Save Program Curriculum
 */
function saveCriteria2_1_Data(currentUserStaffId, values) {
  const url = `/admin/nba/2.1/new-program-curriculum?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * GET – Program Curriculum by Cycle Subcategory & Staff
 */
function getCriteria2_1_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/2.1/new-program-curriculum/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * GET – Contributor cards (Coordinator / Sub-Coordinator)
 */
function getallCardDetails(cycleSubCategoryId) {
  const url = `/admin/nba/2.1/new-program-curriculum/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * DELETE – Soft Delete Program Curriculum
 */
function deleteCriteria2_1Data(id) {
  const url = `/admin/nba/2.1/new-program-curriculum/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * PUT – Update Program Curriculum
 */
function putCriteria2_1_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/2.1/new-program-curriculum/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

// ==================== CRITERIA 2.2 - TEACHING LEARNING PROCESS ====================

/**
 * POST – Create Teaching Learning Process
 */
function saveCriteria2_2_Data(currentUserStaffId, values) {
  const url = `/admin/nba/2.2/new-teaching-learning-process?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * GET – Teaching Learning Process by Cycle Subcategory & Staff
 */
function getCriteria2_2_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/2.2/new-teaching-learning-process/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * GET – All Teaching Learning Process Contributors
 */
function getAllCriteria2_2_Data(cycleSubCategoryId) {
  const url = `/admin/nba/2.2/new-teaching-learning-process/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * DELETE – Soft Delete Teaching Learning Process
 */
function deleteCriteria2_2Data(id) {
  const url = `/admin/nba/2.2/new-teaching-learning-process/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * PUT – Update Teaching Learning Process
 */
function putCriteria2_2_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/2.2/new-teaching-learning-process/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

/**
 * PUT – Update Teaching Learning Process Approval Status
 */
function updateCriteria2_2Status(statusPayload, approverStaffId) {
  const payload = {
    id: statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null,
    approved_by: approverStaffId,
    approved_by_name: statusPayload.approved_by_name || '',
  };

  const url = `/admin/nba/2.2/new-teaching-learning-process/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}