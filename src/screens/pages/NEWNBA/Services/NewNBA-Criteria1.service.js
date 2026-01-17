/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

export const newnbaCriteria1Service = {

  // ===============================
  // Criteria 1.1 APIs
  // ===============================
  saveCriteria1_1_Data,
  getCriteria1_1_Data,
  deleteCriteria1_1Data,
  putCriteria1_1_Data,
  getAllCriteria1_1_Data,
  updateCardStatus,
  getallCardDetails,

  // ===============================
  // Criteria 1.2 APIs
  // ===============================
  saveCriteria1_2_Data,
  getCriteria1_2_Data,
  deleteCriteria1_2_Data,
  putCriteria1_2_Data,
  getAllCriteria1_2_Data,
  updateCriteria1_2_Status,

  // ===============================
  // Criteria 1.3 APIs (NEW)
  // ===============================
  saveCriteria1_3_Data,
  getCriteria1_3_Data,
  deleteCriteria1_3_Data,
  putCriteria1_3_Data,
  getAllCriteria1_3_Data,
  updateCriteria1_3_Status,

  // ===============================
  // Criteria 1.4 APIs (NEW)
  // ===============================
  saveCriteria1_4_Data,
  getCriteria1_4_Data,
  deleteCriteria1_4_Data,
  putCriteria1_4_Data,
  getAllCriteria1_4_Data,
  updateCriteria1_4_Status,

  // ===============================
  // Criteria 1.5 APIs
  // ===============================
  saveCriteria1_5_Data,
  getCriteria1_5_Data,
  deleteCriteria1_5_Data,
  putCriteria1_5_Data,
  getAllCriteria1_5_Data,
  updateCriteria1_5_Status,

  // ===============================
  // Marks Obtained
  // ===============================
  saveMoMarks,
  getMoMarks,
  putMoMarks
};

//
// =====================================================================
// Criteria 1.1 – Vision & Mission
// =====================================================================
//

function getAllCriteria1_1_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.1/new-vision-mission/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function updateCardStatus(approverStaffId,payload) {
  console.log(payload);
  const url = `/admin/nba/1.1/new-vision-mission/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function saveCriteria1_1_Data(currentUserStaffId, values) {
  const url = `/admin/nba/1.1/new-vision-mission?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_1_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.1/new-vision-mission/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getallCardDetails(cycleSubCategoryId) {
  const url = `/admin/nba/1.1/new-vision-mission/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function deleteCriteria1_1Data(id) {
  const url = `/admin/nba/1.1/new-vision-mission/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function putCriteria1_1_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/1.1/new-vision-mission/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//
// =====================================================================
// Criteria 1.2 – PEO
// =====================================================================
//

function saveCriteria1_2_Data(currentUserStaffId, values) {
  const url = `/admin/nba/1.2/new-peo?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_2_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.2/new-peo/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function deleteCriteria1_2_Data(id) {
  const url = `/admin/nba/1.2/new-peo/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function putCriteria1_2_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/1.2/new-peo/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getAllCriteria1_2_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.2/new-peo/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function updateCriteria1_2_Status(approverStaffId, payload) {
  const url = `/admin/nba/1.2/new-peo/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

//
// =====================================================================
// Criteria 1.3 – Vision Mission Dissemination (NEW)
// =====================================================================
//

function saveCriteria1_3_Data(currentUserStaffId, values) {
  const url = `/admin/nba/1.3/new-vision-mission-dissemination?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_3_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.3/new-vision-mission-dissemination/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function deleteCriteria1_3_Data(id) {
  const url = `/admin/nba/1.3/new-vision-mission-dissemination/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function putCriteria1_3_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/1.3/new-vision-mission-dissemination/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getAllCriteria1_3_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.3/new-vision-mission-dissemination/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function updateCriteria1_3_Status(approverStaffId, payload) {
  const url = `/admin/nba/1.3/new-vision-mission-dissemination/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

//
// =====================================================================
// Criteria 1.4 – Process Defining Vision Mission (NEW)
// =====================================================================
//

function saveCriteria1_4_Data(currentUserStaffId, values) {
  const url = `/admin/nba/1.4/new-process-defining-vm?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_4_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.4/new-process-defining-vm/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function deleteCriteria1_4_Data(id) {
  const url = `/admin/nba/1.4/new-process-defining-vm/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function putCriteria1_4_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/1.4/new-process-defining-vm/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getAllCriteria1_4_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.4/new-process-defining-vm/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function updateCriteria1_4_Status(approverStaffId, payload) {
  const url = `/admin/nba/1.4/new-process-defining-vm/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

// =====================================================================
// Criteria 1.5 – Consistency PEO Mission
// =====================================================================

function saveCriteria1_5_Data(currentUserStaffId, values) {
  const url = `/admin/nba/1.5/new-consistency-peo-mission?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria1_5_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/1.5/new-consistency-peo-mission/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria1_5_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/1.5/new-consistency-peo-mission/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function deleteCriteria1_5_Data(id) {
  const url = `/admin/nba/1.5/new-consistency-peo-mission/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function getAllCriteria1_5_Data(cycleSubCategoryId) {
  const url = `/admin/nba/1.5/new-consistency-peo-mission/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria1_5_Status(approverStaffId, payload) {
  const url = `/admin/nba/1.5/new-consistency-peo-mission/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

//
// =====================================================================
// Marks Obtained
// =====================================================================
//

function getMoMarks(cycleSubCategoryId) {
  const url = `/nba-evaluation-marks/by-sub-category/${cycleSubCategoryId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
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
