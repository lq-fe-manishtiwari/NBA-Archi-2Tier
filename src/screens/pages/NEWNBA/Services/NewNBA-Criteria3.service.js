/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

export const newnbaCriteria3Service = {
  /* ========= 3.1 ========= */
  saveCriteria3_1_Data,
  putCriteria3_1_Data,
  getCriteria3_1_Data,
  getAllCriteria3_1_Data,
  updateCriteria3_1_Status,
  deleteCriteria3_1Data,

  /* ========= 3.2 ========= */
  saveCriteria3_2_Data,
  putCriteria3_2_Data,
  getCriteria3_2_Data,
  getAllCriteria3_2_Data,
  updateCriteria3_2_Status,
  deleteCriteria3_2_Data,

  /* ========= 3.3 ========= */
  saveCriteria3_3_Data,
  putCriteria3_3_Data,
  getCriteria3_3_Data,
  getAllCriteria3_3_Data,
  updateCriteria3_3_Status,
  deleteCriteria3_3_Data,
};

/* ========================================================= */
/* ======================= 3.1 ============================== */
/* ========================================================= */

function saveCriteria3_1_Data(currentUserStaffId, values) {
  const url = `/admin/nba/3.1/new-course-outcome-correlation?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function putCriteria3_1_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/3.1/new-course-outcome-correlation/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria3_1_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/3.1/new-course-outcome-correlation/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getAllCriteria3_1_Data(cycleSubCategoryId) {
  const url = `/admin/nba/3.1/new-course-outcome-correlation/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria3_1_Status(statusPayload, approverStaffId) {
  const payload = {
    id: statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null,
    approved_by: statusPayload.approved_by || approverStaffId,
    approved_by_name: statusPayload.approved_by_name || null,
  };

  const url = `/admin/nba/3.1/new-course-outcome-correlation/approval-status?approverStaffId=${approverStaffId}`;

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function deleteCriteria3_1Data(id) {
  const url = `/admin/nba/3.1/new-course-outcome-correlation/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

/* ========================================================= */
/* ======================= 3.2 ============================== */
/* ========================================================= */

function saveCriteria3_2_Data(currentUserStaffId, values) {
  const url = `/admin/nba/3.2/new-attainment-course-outcome?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function putCriteria3_2_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/3.2/new-attainment-course-outcome/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria3_2_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/3.2/new-attainment-course-outcome/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getAllCriteria3_2_Data(cycleSubCategoryId) {
  const url = `/admin/nba/3.2/new-attainment-course-outcome/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria3_2_Status(statusPayload, approverStaffId) {
  const payload = {
    id: statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null,
    approved_by: statusPayload.approved_by || approverStaffId,
    approved_by_name: statusPayload.approved_by_name || null,
  };

  const url = `/admin/nba/3.2/new-attainment-course-outcome/approval-status?approverStaffId=${approverStaffId}`;

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function deleteCriteria3_2_Data(id) {
  const url = `/admin/nba/3.2/new-attainment-course-outcome/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

/* ========================================================= */
/* ======================= 3.3 ============================== */
/* ========================================================= */

function saveCriteria3_3_Data(currentUserStaffId, values) {
  const url = `/admin/nba/3.3/new-attainment-po-pso?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function putCriteria3_3_Data(id, currentUserStaffId, values) {
  const url = `/admin/nba/3.3/new-attainment-po-pso/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria3_3_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/3.3/new-attainment-po-pso/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getAllCriteria3_3_Data(cycleSubCategoryId) {
  const url = `/admin/nba/3.3/new-attainment-po-pso/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCriteria3_3_Status(statusPayload, approverStaffId) {
  const payload = {
    id: statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null,
    approved_by: statusPayload.approved_by || approverStaffId,
    approved_by_name: statusPayload.approved_by_name || null,
  };

  const url = `/admin/nba/3.3/new-attainment-po-pso/approval-status?approverStaffId=${approverStaffId}`;

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function deleteCriteria3_3_Data(id) {
  const url = `/admin/nba/3.3/new-attainment-po-pso/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}
