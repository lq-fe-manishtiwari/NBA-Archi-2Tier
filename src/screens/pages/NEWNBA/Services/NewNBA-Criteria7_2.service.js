/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

export const newnbaCriteria7_2_Service = {
  saveCriteria7_2_Data,
  getCriteria7_2_Data,
  getAllCardDetails_7_2,
  updateCardStatus,
  updateCriteria7_2,
  deleteCriteria7_2,
};

// -------------------- API Functions --------------------

function saveCriteria7_2_Data(payload) {
  const url = `/admin/nba/7.2/lab-learning-facilities`; // UPDATED

  const requestPayload = {
    other_staff_id: payload.otherStaffId,
    cycle_sub_category_id: payload.cycleSubCategoryId,
    facility_details: payload.facility_details,
    facility_table: payload.facility_table,
    facility_document: payload.facility_document
  };

  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function getCriteria7_2_Data(cycleSubCategoryId, staffId) {
  const url = `/admin/nba/7.2/lab-learning-facilities/cycle-subcategory/${cycleSubCategoryId}/staff/${staffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCardDetails_7_2(cycleSubCategoryId) {
  const url = `/admin/nba/7.2/lab-learning-facilities/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function updateCardStatus(statusPayload, staffId) {
  const url = `/admin/nba/7.2/lab-learning-facilities/approval-status?approverId=${staffId}`;
    console.log("updateCardStatus", statusPayload);
  const requestPayload = {
    id: statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || '',
    approved_by: statusPayload.approved_by || '',
    approved_by_name: statusPayload.approved_by_name || '',
  };

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function updateCriteria7_2(entryId, payload) {
  const url = `/admin/nba/7.2/lab-learning-facilities/${entryId}`;

  const requestPayload = {
    other_staff_id: payload.otherStaffId,
    cycle_sub_category_id: payload.cycleSubCategoryId,
    facility_details: payload.facility_details,
    facility_table: payload.facility_table,
    facility_document: payload.facility_document
  };

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function deleteCriteria7_2(entryId) {
  const url = `/admin/nba/7.2/lab-learning-facilities/${entryId}`;

  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}
