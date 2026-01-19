// src/Services/NewNBA-Criteria5.service.js

import {
  apiNBARequest,
  authHeader,
  authHeaderToPost,
  handleResponse,
} from '@/_services/api';

export const newnbaCriteria5Service = {
  // 5.1
  getCriteria5_1_Data,
  saveCriteria5_1_Data,
  updateCriteria5_1_Data,
  updateCriteria5_1_ApprovalStatus,
  deleteCriteria5_1_Data,
  getallCardDetails5_1Data,

  // 5.2
  getCriteria5_2_Data,
  saveCriteria5_2_Data,
  updateCriteria5_2_Data,
  updateCriteria5_2_ApprovalStatus,
  deleteCriteria5_2_Data,
  getallCardDetails5_2Data,

  // 5.3
  getCriteria5_3_Data,
  saveCriteria5_3_Data,
  updateCriteria5_3_Data,
  updateCriteria5_3_ApprovalStatus,
  deleteCriteria5_3_Data,
  getallCardDetails5_3Data,

  // 5.4
  getCriteria5_4_Data,
  saveCriteria5_4_Data,
  updateCriteria5_4_Data,
  updateCriteria5_4_ApprovalStatus,
  deleteCriteria5_4_Data,
  getallCardDetails5_4Data,

  // 5.5
  getCriteria5_5_Data,
  saveCriteria5_5_Data,
  updateCriteria5_5_Data,
  updateCriteria5_5_ApprovalStatus,
  deleteCriteria5_5_Data,
  getallCardDetails5_5Data,

  // 5.6
  getCriteria5_6_Data,
  saveCriteria5_6_Data,
  updateCriteria5_6_Data,
  updateCriteria5_6_ApprovalStatus,
  deleteCriteria5_6_Data,
  getallCardDetails5_6Data,

  // 5.7
  getCriteria5_7_Data,
  saveCriteria5_7_Data,
  updateCriteria5_7_Data,
  updateCriteria5_7_ApprovalStatus,
  deleteCriteria5_7_Data,
  getallCardDetails5_7Data,

  // 5.8
  getCriteria5_8_Data,
  saveCriteria5_8_Data,
  updateCriteria5_8_Data,
  updateCriteria5_8_ApprovalStatus,
  deleteCriteria5_8_Data,
  getallCardDetails5_8Data,

  // 5.9
  getCriteria5_9_Data,
  saveCriteria5_9_Data,
  updateCriteria5_9_Data,
  updateCriteria5_9_ApprovalStatus,
  deleteCriteria5_9_Data,
  getallCardDetails5_9Data,
};

/* ========================= 5.1 ========================= */

function getCriteria5_1_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.1/new-student-faculty-ratio/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_1_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.1/new-student-faculty-ratio?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_1_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.1/new-student-faculty-ratio/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_1_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.1/new-student-faculty-ratio/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_1_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.1/new-student-faculty-ratio/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_1Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.1/new-student-faculty-ratio/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

/* ========================= 5.2 ========================= */

function getCriteria5_2_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.2/new-faculty-cadre-ratio/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_2_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.2/new-faculty-cadre-ratio?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_2_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.2/new-faculty-cadre-ratio/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_2_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.2/new-faculty-cadre-ratio/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_2_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.2/new-faculty-cadre-ratio/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_2Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.2/new-faculty-cadre-ratio/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

/* ========================= 5.3 ========================= */

function getCriteria5_3_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.3/new-faculty-qualification/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_3_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.3/new-faculty-qualification?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_3_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.3/new-faculty-qualification/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_3_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.3/new-faculty-qualification/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_3_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.3/new-faculty-qualification/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_3Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.3/new-faculty-qualification/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

/* ========================= 5.4 ========================= */

function getCriteria5_4_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.4/new-faculty-retention/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_4_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.4/new-faculty-retention?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_4_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.4/new-faculty-retention/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_4_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.4/new-faculty-retention/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_4_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.4/new-faculty-retention/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_4Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.4/new-faculty-retention/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

/* ========================= 5.5 ========================= */

function getCriteria5_5_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.5/new-faculty-innovations/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_5_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.5/new-faculty-innovations?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_5_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.5/new-faculty-innovations/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_5_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.5/new-faculty-innovations/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_5_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.5/new-faculty-innovations/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_5Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.5/new-faculty-innovations/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

/* ========================= 5.6 ========================= */

function getCriteria5_6_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.6/new-faculty-development/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_6_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.6/new-faculty-development?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_6_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.6/new-faculty-development/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_6_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.6/new-faculty-development/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_6_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.6/new-faculty-development/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_6Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.6/new-faculty-development/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

/* ========================= 5.7 ========================= */

function getCriteria5_7_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.7/new-research-development/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_7_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.7/new-research-development?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_7_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.7/new-research-development/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_7_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.7/new-research-development/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_7_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.7/new-research-development/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_7Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.7/new-research-development/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

/* ========================= 5.8 ========================= */

function getCriteria5_8_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.8/new-faculty-performance-appraisal/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_8_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.8/new-faculty-performance-appraisal?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_8_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.8/new-faculty-performance-appraisal/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_8_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.8/new-faculty-performance-appraisal/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_8_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.8/new-faculty-performance-appraisal/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_8Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.8/new-faculty-performance-appraisal/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

/* ========================= 5.9 ========================= */

function getCriteria5_9_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `/admin/nba/5.9/new-visiting-adjunct-faculty/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}

function saveCriteria5_9_Data(values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.9/new-visiting-adjunct-faculty?currentUserStaffId=${currentUserStaffId}`,
    { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_9_Data(id, values, currentUserStaffId) {
  return apiNBARequest(
    `/admin/nba/5.9/new-visiting-adjunct-faculty/${id}?currentUserStaffId=${currentUserStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(values) }
  ).then(handleResponse);
}

function updateCriteria5_9_ApprovalStatus(approverStaffId, approvalData) {
  return apiNBARequest(
    `/admin/nba/5.9/new-visiting-adjunct-faculty/approval-status?approverStaffId=${approverStaffId}`,
    { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(approvalData) }
  ).then(handleResponse);
}

function deleteCriteria5_9_Data(id) {
  return apiNBARequest(
    `/admin/nba/5.9/new-visiting-adjunct-faculty/${id}`,
    { method: 'DELETE', headers: authHeader() }
  ).then(handleResponse);
}

function getallCardDetails5_9Data(cycleSubCategoryId) {
  return apiNBARequest(
    `/admin/nba/5.9/new-visiting-adjunct-faculty/contributor/cycle-subcategory/${cycleSubCategoryId}`,
    { method: 'GET', headers: authHeader() }
  ).then(handleResponse);
}
