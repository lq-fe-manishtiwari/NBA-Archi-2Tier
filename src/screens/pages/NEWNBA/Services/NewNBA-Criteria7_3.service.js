/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

export const newnbaCriteria7_3_Service = {
  saveCriteria7_3_Data,
  getCriteria7_3_Data,
  getAllCardDetails_7_3,
  updateCardStatus,
  updateCriteria7_3,
  deleteCriteria7_3,
};

// -------------------- API Functions --------------------

function saveCriteria7_3_Data(payload) {
  const url = `/admin/nba/7.3/lab-maintenance`; // UPDATED

  const requestPayload = {
    other_staff_id: payload.otherStaffId,
    cycle_sub_category_id: payload.cycleSubCategoryId,
    maintenance_details: payload.maintenance_details,
    maintenance_table: payload.maintenance_table,
    maintenance_document: payload.maintenance_document
  };

  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function getCriteria7_3_Data(cycleSubCategoryId, staffId) {
  const url = `/admin/nba/7.3/lab-maintenance/cycle-subcategory/${cycleSubCategoryId}/staff/${staffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCardDetails_7_3(cycleSubCategoryId) {
  const url = `/admin/nba/7.3/lab-maintenance/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function updateCardStatus(statusPayload, staffId) {
  const url = `/admin/nba/7.3/lab-maintenance/approval-status?approverId=${staffId}`;
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

function updateCriteria7_3(entryId, payload) {
  const url = `/admin/nba/7.3/lab-maintenance/${entryId}`;

  const requestPayload = {
    other_staff_id: payload.otherStaffId,
    cycle_sub_category_id: payload.cycleSubCategoryId,
    maintenance_details: payload.maintenance_details,
    maintenance_table: payload.maintenance_table,
    maintenance_document: payload.maintenance_document
  };

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function deleteCriteria7_3(entryId) {
  const url = `/admin/nba/7.3/lab-maintenance/${entryId}`;

  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}
