/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';

export const newnbaCriteria7_5_Service = {
  saveCriteria7_5_Data,
  getCriteria7_5_Data,
  getAllCardDetails_7_5,
  updateCardStatus,
  updateCriteria7_5,
  deleteCriteria7_5,
};

// -------------------- API Functions --------------------

function saveCriteria7_5_Data(payload) {
  const url = `/admin/nba/7.5/project-research-lab`; // UPDATED

  const requestPayload = {
    other_staff_id: payload.otherStaffId,
    cycle_sub_category_id: payload.cycleSubCategoryId,
    lab_details: payload.lab_details,
    project_table: payload.project_table,
    documents: payload.documents
  };

  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function getCriteria7_5_Data(cycleSubCategoryId, staffId) {
  const url = `/admin/nba/7.5/project-research-lab/cycle-subcategory/${cycleSubCategoryId}/staff/${staffId}`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function getAllCardDetails_7_5(cycleSubCategoryId) {
  const url = `/admin/nba/7.5/project-research-lab/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
}

function updateCardStatus(statusPayload, staffId) {
  const url = `/admin/nba/7.5/project-research-lab/approval-status?approverId=${staffId}`;
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

function updateCriteria7_5(entryId, payload) {
  const url = `/admin/nba/7.5/project-research-lab/${entryId}`;

  const requestPayload = {
    other_staff_id: payload.otherStaffId,
    cycle_sub_category_id: payload.cycleSubCategoryId,
    lab_details: payload.lab_details,
    project_table: payload.project_table,
    documents: payload.documents
  };

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function deleteCriteria7_5(entryId) {
  const url = `/admin/nba/7.5/project-research-lab/${entryId}`;

  return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
}
