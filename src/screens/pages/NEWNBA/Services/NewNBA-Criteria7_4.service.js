/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

export const newnbaCriteria7_4_Service = {
  saveCriteria7_4_Data,
  getCriteria7_4_Data,
  getAllCardDetails_7_4,
  updateCardStatus,
  updateCriteria7_4,
  deleteCriteria7_4,
};

// -------------------- API Functions --------------------

function saveCriteria7_4_Data(payload) {
  const url = `/admin/nba/7.4/lab-safety`; // UPDATED

  const requestPayload = {
    other_staff_id: payload.otherStaffId,
    cycle_sub_category_id: payload.cycleSubCategoryId,
    lab_safety_details: payload.lab_safety_details,
    lab_safety_table: payload.lab_safety_table,
    lab_safety_document: payload.lab_safety_document
  };

  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function getCriteria7_4_Data(cycleSubCategoryId, staffId) {
  const url = `/admin/nba/7.4/lab-safety/cycle-subcategory/${cycleSubCategoryId}/staff/${staffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCardDetails_7_4(cycleSubCategoryId) {
  const url = `/admin/nba/7.4/lab-safety/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function updateCardStatus(statusPayload, staffId) {
  const url = `/admin/nba/7.4/lab-safety/approval-status?approverId=${staffId}`;
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

function updateCriteria7_4(entryId, payload) {
  const url = `/admin/nba/7.4/lab-safety/${entryId}`;
  console.log("updateCriteria7_4", payload)

  const requestPayload = {
    other_staff_id: payload.otherStaffId,
    cycle_sub_category_id: payload.cycleSubCategoryId,
    lab_safety_details: payload.lab_safety_details,
    lab_safety_table: payload.lab_safety_table,
    lab_safety_document: payload.lab_safety_document
  };

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function deleteCriteria7_4(entryId) {
  const url = `/admin/nba/7.4/lab-safety/${entryId}`;

  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}
