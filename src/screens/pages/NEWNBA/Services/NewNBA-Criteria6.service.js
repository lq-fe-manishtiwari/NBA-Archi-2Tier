/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

export const newnbaCriteria6Service = {

  // 6.1 – Classrooms Workshops
  saveCriteria6_1_Data,
  getCriteria6_1_Data,
  deleteCriteria6_1_Data,
  putCriteria6_1_Data,
  getAllCriteria6_1_Data,
  updateCardStatus6_1,
  getallCardDetails6_1,

  // 6.2 – Development Activities
  saveCriteria6_2_Data,
  getCriteria6_2_Data,
  deleteCriteria6_2_Data,
  putCriteria6_2_Data,
  getAllCriteria6_2_Data,
  updateCardStatus6_2,
  getallCardDetails6_2,
};

///////////////////////////
// 6.1 Classrooms Workshops
///////////////////////////

function getAllCriteria6_1_Data(cycleSubCategoryId) {
  const url = `/admin/nba/6.1/new-classrooms-workshops/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus6_1(statusPayload, approverStaffId) {
  const payload = {
    id: statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null,
    approved_by: statusPayload.approved_by,
    approved_by_name: statusPayload.approved_by_name,
  };

  const url = `/admin/nba/6.1/new-classrooms-workshops/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function saveCriteria6_1_Data(values, currentUserStaffId) {
  const url = `/admin/nba/6.1/new-classrooms-workshops?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria6_1_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/6.1/new-classrooms-workshops/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails6_1(cycleSubCategoryId) {
  const url = `/admin/nba/6.1/new-classrooms-workshops/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function deleteCriteria6_1_Data(id) {
  const url = `/admin/nba/6.1/new-classrooms-workshops/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria6_1_Data(id, values, currentUserStaffId) {
  const url = `/admin/nba/6.1/new-classrooms-workshops/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

////////////////////////////
// 6.2 Development Activities
////////////////////////////

function getAllCriteria6_2_Data(cycleSubCategoryId) {
  const url = `/admin/nba/6.2/development-activities/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus6_2(statusPayload, approverStaffId) {
  const payload = {
    id: statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null,
    approved_by: statusPayload.approved_by,
    approved_by_name: statusPayload.approved_by_name,
  };

  const url = `/admin/nba/6.2/development-activities/approval-status?approverStaffId=${approverStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function saveCriteria6_2_Data(values, currentUserStaffId) {
  const url = `/admin/nba/6.2/development-activities?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria6_2_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/6.2/development-activities/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails6_2(cycleSubCategoryId) {
  const url = `/admin/nba/6.2/development-activities/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function deleteCriteria6_2_Data(id) {
  const url = `/admin/nba/6.2/development-activities/${id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria6_2_Data(id, values, currentUserStaffId) {
  const url = `/admin/nba/6.2/development-activities/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}
