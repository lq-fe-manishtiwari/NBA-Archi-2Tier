/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

export const newnbaCriteria7Service = {
  // 7.1
  saveCriteria7_1_Data,
  getCriteria7_1_Data,
  updateCriteria7_1_Data,
  deleteCriteria7_1_Data,
  updateCriteria7_1_Status,
  getAllCriteria7_1_Cards,

  // 7.2
  saveCriteria7_2_Data,
  getCriteria7_2_Data,
  updateCriteria7_2_Data,
  deleteCriteria7_2_Data,
  updateCriteria7_2_Status,
  getAllCriteria7_2_Cards,

  // 7.3
  saveCriteria7_3_Data,
  getCriteria7_3_Data,
  updateCriteria7_3_Data,
  deleteCriteria7_3_Data,
  updateCriteria7_3_Status,
  getAllCriteria7_3_Cards,

  // 7.4
  saveCriteria7_4_Data,
  getCriteria7_4_Data,
  updateCriteria7_4_Data,
  deleteCriteria7_4_Data,
  updateCriteria7_4_Status,
  getAllCriteria7_4_Cards,

  // 7.5
  saveCriteria7_5_Data,
  getCriteria7_5_Data,
  updateCriteria7_5_Data,
  deleteCriteria7_5_Data,
  updateCriteria7_5_Status,
  getAllCriteria7_5_Cards,

  // 7.6
  saveCriteria7_6_Data,
  getCriteria7_6_Data,
  updateCriteria7_6_Data,
  deleteCriteria7_6_Data,
  updateCriteria7_6_Status,
  getAllCriteria7_6_Cards,
};

/////////////////////////////////////////////////////
// 7.1 Success Index Without Backlogs
/////////////////////////////////////////////////////

function saveCriteria7_1_Data(payload, currentUserStaffId) {
  const url = `/admin/nba/7.1/new-success-index-without-backlogs?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function updateCriteria7_1_Data(id, payload, currentUserStaffId) {
  const url = `/admin/nba/7.1/new-success-index-without-backlogs/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function updateCriteria7_1_Status(payload, approverStaffId) {
  const url = `/admin/nba/7.1/new-success-index-without-backlogs/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function deleteCriteria7_1_Data(id) {
  const url = `/admin/nba/7.1/new-success-index-without-backlogs/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function getCriteria7_1_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/7.1/new-success-index-without-backlogs/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCriteria7_1_Cards(cycleSubCategoryId) {
  const url = `/admin/nba/7.1/new-success-index-without-backlogs/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

/////////////////////////////////////////////////////
// 7.2 Improve Placement Higher Studies
/////////////////////////////////////////////////////

function saveCriteria7_2_Data(payload, currentUserStaffId) {
  const url = `/admin/nba/7.2/new-improve-placement-higher-studies?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_2_Data(id, payload, currentUserStaffId) {
  const url = `/admin/nba/7.2/new-improve-placement-higher-studies/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_2_Status(payload, approverStaffId) {
  const url = `/admin/nba/7.2/new-improve-placement-higher-studies/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function deleteCriteria7_2_Data(id) {
  const url = `/admin/nba/7.2/new-improve-placement-higher-studies/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function getCriteria7_2_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/7.2/new-improve-placement-higher-studies/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCriteria7_2_Cards(cycleSubCategoryId) {
  const url = `/admin/nba/7.2/new-improve-placement-higher-studies/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

/////////////////////////////////////////////////////
// 7.3 Improve Sponsored Projects
/////////////////////////////////////////////////////

function saveCriteria7_3_Data(payload, currentUserStaffId) {
  const url = `/admin/nba/7.3/new-improve-sponsored-projects?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_3_Data(id, payload, currentUserStaffId) {
  const url = `/admin/nba/7.3/new-improve-sponsored-projects/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_3_Status(payload, approverStaffId) {
  const url = `/admin/nba/7.3/new-improve-sponsored-projects/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function deleteCriteria7_3_Data(id) {
  const url = `/admin/nba/7.3/new-improve-sponsored-projects/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function getCriteria7_3_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/7.3/new-improve-sponsored-projects/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCriteria7_3_Cards(cycleSubCategoryId) {
  const url = `/admin/nba/7.3/new-improve-sponsored-projects/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

/////////////////////////////////////////////////////
// 7.4 Academic Audit Actions
/////////////////////////////////////////////////////

function saveCriteria7_4_Data(payload, currentUserStaffId) {
  const url = `/admin/nba/7.4/new-academic-audit-actions?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_4_Data(id, payload, currentUserStaffId) {
  const url = `/admin/nba/7.4/new-academic-audit-actions/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_4_Status(payload, approverStaffId) {
  const url = `/admin/nba/7.4/new-academic-audit-actions/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function deleteCriteria7_4_Data(id) {
  const url = `/admin/nba/7.4/new-academic-audit-actions/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function getCriteria7_4_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/7.4/new-academic-audit-actions/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCriteria7_4_Cards(cycleSubCategoryId) {
  const url = `/admin/nba/7.4/new-academic-audit-actions/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

/////////////////////////////////////////////////////
// 7.5 Improve Students Admitted
/////////////////////////////////////////////////////

function saveCriteria7_5_Data(payload, currentUserStaffId) {
  const url = `/admin/nba/7.5/new-improve-students-admitted?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_5_Data(id, payload, currentUserStaffId) {
  const url = `/admin/nba/7.5/new-improve-students-admitted/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_5_Status(payload, approverStaffId) {
  const url = `/admin/nba/7.5/new-improve-students-admitted/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function deleteCriteria7_5_Data(id) {
  const url = `/admin/nba/7.5/new-improve-students-admitted/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function getCriteria7_5_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/7.5/new-improve-students-admitted/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCriteria7_5_Cards(cycleSubCategoryId) {
  const url = `/admin/nba/7.5/new-improve-students-admitted/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

/////////////////////////////////////////////////////
// 7.6 PO Evaluation Action Taken
/////////////////////////////////////////////////////

function saveCriteria7_6_Data(payload, currentUserStaffId) {
  const url = `/admin/nba/7.6/new-po-evaluation-action-taken?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'POST', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_6_Data(id, payload, currentUserStaffId) {
  const url = `/admin/nba/7.6/new-po-evaluation-action-taken/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function updateCriteria7_6_Status(payload, approverStaffId) {
  const url = `/admin/nba/7.6/new-po-evaluation-action-taken/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, { method: 'PUT', headers: authHeaderToPost(), body: JSON.stringify(payload) }).then(handleResponse);
}

function deleteCriteria7_6_Data(id) {
  const url = `/admin/nba/7.6/new-po-evaluation-action-taken/${id}`;
  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}

function getCriteria7_6_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/7.6/new-po-evaluation-action-taken/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCriteria7_6_Cards(cycleSubCategoryId) {
  const url = `/admin/nba/7.6/new-po-evaluation-action-taken/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}
