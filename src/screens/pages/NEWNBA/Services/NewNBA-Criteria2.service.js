/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
  AcademicAPI,
} from '@/_services/api';

export const newnbaCriteria2Service = {

  // newnba apis
  saveCriteria2_1_Data,
  getCriteria2_1_Data,
  deleteCriteria2_1Data,
  putCriteria2_1_Data,
  getAllCriteria2_1_Data,
  updateCardStatus,
  getallCardDetails,
};

function getAllCriteria2_1_Data(cycleSubCategoryId) {
  const url = `/admin/nba/2.1/teaching-learning-quality/cycle-subcategory/${cycleSubCategoryId}/all`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus(statusPayload, currentUserStaffId) {
  // Ensure payload has correct format for Criteria 2
  const payload = {
    teaching_learning_quality_id: statusPayload.id || statusPayload.teaching_learning_quality_id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/2.1/teaching-learning-quality/approval-status?approverId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria2_1_Data(currentUserStaffId,values) {
  const url = `/admin/nba/2.1/teaching-learning-quality?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria2_1_Data(cycleSubCategoryId, otherStaffId) {
  // /api/admin/nba/2.1/teaching-learning-quality/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId
   const url = `/admin/nba/2.1/teaching-learning-quality/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails(cycleSubCategoryId) {
  const url = `/admin/nba/2.1/teaching-learning-quality/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Delete Criteria 1.1 data
 *
 * @param {string | number} Id
 */
function deleteCriteria2_1Data(Id) {
  const url = `/admin/nba/2.1/teaching-learning-quality/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}


function putCriteria2_1_Data(id,currentUserStaffId,values) {
  // api/admin/nba/2.1/teaching-learning-quality/45?currentUserStaffId=123
  const url = `/admin/nba/2.1/teaching-learning-quality/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}
