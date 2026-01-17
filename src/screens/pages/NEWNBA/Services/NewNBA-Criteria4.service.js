/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
  AcademicAPI,
} from '@/_services/api';

export const newnbaCriteria4Service = {

  // 4.A
  saveCriteria4_A_Data,
  getCriteria4_A_Data,
  deleteCriteria4_AData,
  putCriteria4_A_Data,
  getAllCriteria4_A_Data,
  updateCardStatus4_A,
  getallCardDetails4_A,

  // 4.B
  saveCriteria4_B_Data,
  getCriteria4_B_Data,
  deleteCriteria4_BData,
  putCriteria4_B_Data,
  getAllCriteria4_B_Data,
  updateCardStatus4_B,
  getallCardDetails4_B,

  // 4.C 
  saveCriteria4_C_Data,
  getCriteria4_C_Data,
  deleteCriteria4_CData,
  putCriteria4_C_Data,
  getAllCriteria4_C_Data,
  updateCardStatus4_C,
  getallCardDetails4_C,

  // 4.1
  saveCriteria4_1_Data,
  getCriteria4_1_Data,
  deleteCriteria4_1Data,
  putCriteria4_1_Data,
  getAllCriteria4_1_Data,
  updateCardStatus4_1,
  getallCardDetails4_1,

  // 4.2
  saveCriteria4_2_Data,
  getCriteria4_2_Data,
  deleteCriteria4_2Data,
  putCriteria4_2_Data,
  getAllCriteria4_2_Data,
  updateCardStatus4_2,
  getallCardDetails4_2,

  // 4.3
  saveCriteria4_3_Data,
  getCriteria4_3_Data,
  deleteCriteria4_3Data,
  putCriteria4_3_Data,
  getAllCriteria4_3_Data,
  updateCardStatus4_3,
  getallCardDetails4_3,

  // 4.4
  saveCriteria4_4_Data,
  getCriteria4_4_Data,
  deleteCriteria4_4Data,
  putCriteria4_4_Data,
  getAllCriteria4_4_Data,
  updateCardStatus4_4,
  getallCardDetails4_4,

  // 4.5
  saveCriteria4_5_Data,
  getCriteria4_5_Data,
  deleteCriteria4_5Data,
  putCriteria4_5_Data,
  getAllCriteria4_5_Data,
  updateCardStatus4_5,
  getallCardDetails4_5,

  // 4.6
  saveCriteria4_6_Data,
  getCriteria4_6_Data,
  deleteCriteria4_6Data,
  putCriteria4_6_Data,
  getAllCriteria4_6_Data,
  updateCardStatus4_6,
  getallCardDetails4_6,

  // 4.7
  saveCriteria4_7_Data,
  getCriteria4_7_Data,
  deleteCriteria4_7Data,
  putCriteria4_7_Data,
  getAllCriteria4_7_Data,
  updateCardStatus4_7,
  getallCardDetails4_7,
};

/// 4A //////////

function getAllCriteria4_A_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4a/new-admission-details/ycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_A(statusPayload, currentUserStaffId) {
  const payload = {
    teaching_learning_quality_id: statusPayload.teaching_learning_quality_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4a/new-admission-details/approval-status?approvalId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_A_Data(values,currentUserStaffId) {
  // /api/admin/nba/4a/new-admission-details
  const url = `/admin/nba/4a/new-admission-details?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_A_Data(cycleSubCategoryId, otherStaffId) {
  // /api/admin/nba/4a/new-admission-details/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
   const url = `/admin/nba/4a/new-admission-details/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_A(cycleSubCategoryId) {
  const url = `/admin/nba/4a/new-admission-details/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_AData(Id) {
  //  /api/admin/nba/4a/new-admission-details/{id}
  const url = `/admin/nba/4a/new-admission-details/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_A_Data(id,values,currentUserStaffId) {
  // /api/admin/nba/4a/new-admission-details/{id}
  const url = `/admin/nba/4a/new-admission-details/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 4B  ///////////////////

function getAllCriteria4_B_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4b/new-students-graduated/ycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_B(statusPayload, currentUserStaffId) {
  const payload = {
    teaching_learning_quality_id: statusPayload.teaching_learning_quality_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4b/new-students-graduated/approval-status?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_B_Data(values,currentUserStaffId) {
  // /api/admin/nba/4a/new-admission-details
  const url = `/admin/nba/4b/new-students-graduated?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_B_Data(cycleSubCategoryId, otherStaffId) {
  // /api/admin/nba/4a/new-admission-details/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
   const url = `/admin/nba/4b/new-students-graduated/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_B(cycleSubCategoryId) {
  const url = `/admin/nba/4b/new-students-graduated/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_BData(Id) {
  //  /api/admin/nba/4a/new-admission-details/{id}
  const url = `/admin/nba/4b/new-students-graduated/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_B_Data(id,values,currentUserStaffId) {
  // /api/admin/nba/4a/new-admission-details/{id}
  const url = `/admin/nba/4b/new-students-graduated/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 4C  ///////////////////

function getAllCriteria4_C_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4c/new-students-graduated-stipulated/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_C(statusPayload, currentUserStaffId) {
  const payload = {
    teaching_learning_quality_id: statusPayload.teaching_learning_quality_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4c/new-students-graduated-stipulated/approval-status?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_C_Data(values,currentUserStaffId) {
  const url = `/admin/nba/4c/new-students-graduated-stipulated?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_C_Data(cycleSubCategoryId, otherStaffId) {
   const url = `/admin/nba/4c/new-students-graduated-stipulated/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_C(cycleSubCategoryId) {
  const url = `/admin/nba/4c/new-students-graduated-stipulated/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_CData(Id) {
  const url = `/admin/nba/4c/new-students-graduated-stipulated/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_C_Data(id,values,currentUserStaffId) {
  const url = `/admin/nba/4c/new-students-graduated-stipulated/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 41  ///////////////////

function getAllCriteria4_1_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4.1/new-enrollment-ratio/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_1(statusPayload, currentUserStaffId) {
  const payload = {
    id: statusPayload.enrolment_ratio_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4.1/new-enrollment-ratio/approval-status?approverId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_1_Data(values,currentUserStaffId) {
  // /api/admin/nba/4.1/new-enrollment-ratio
  const url = `/admin/nba/4.1/new-enrollment-ratio?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_1_Data(cycleSubCategoryId, otherStaffId) {
  ///api/admin/nba/4.1/new-enrollment-ratio/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
   const url = `/admin/nba/4.1/new-enrollment-ratio/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_1(cycleSubCategoryId) {
  const url = `/admin/nba/4.1/new-enrollment-ratio/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_1Data(Id) {
  const url = `/admin/nba/4.1/new-enrollment-ratio/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_1_Data(id,values,currentUserStaffId) {
  const url = `/admin/nba/4.1/new-enrollment-ratio/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 42  ///////////////////

function getAllCriteria4_2_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4.2/new-success-rate/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_2(statusPayload, currentUserStaffId) {
  // Ensure payload has correct format for Criteria 1.1
  const payload = {
    id: statusPayload.cri42_success_rate_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4.2/new-success-rate/approval-status?approverId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_2_Data(values,currentUserStaffId) {
  // /api/admin/nba/4.2/new-success-rate
  const url = `/admin/nba/4.2/new-success-rate?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_2_Data(cycleSubCategoryId, otherStaffId) {
   const url = `/admin/nba/4.2/new-success-rate/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_2(cycleSubCategoryId) {
  const url = `/admin/nba/4.2/new-success-rate/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_2Data(Id) {
  const url = `/admin/nba/4.2/new-success-rate/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_2_Data(id,values,currentUserStaffId) {
  const url = `/admin/nba/4.2/new-success-rate/${id}?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 43  ///////////////////

function getAllCriteria4_3_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4.3/academic-performance/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_3(statusPayload, currentUserStaffId) {
  const payload = {
    id: statusPayload.cri43_academic_performance_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4.3/academic-performance/approval-status?approverId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_3_Data(values) {
  const url = `/admin/nba/4.3/academic-performance`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_3_Data(cycleSubCategoryId, otherStaffId) {
   const url = `/admin/nba/4.3/academic-performance/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_3(cycleSubCategoryId) {
  const url = `/admin/nba/4.3/academic-performance/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_3Data(Id) {
  const url = `/admin/nba/4.3/academic-performance/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_3_Data(id,values) {
  const url = `/admin/nba/4.3/academic-performance/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 44  ///////////////////

function getAllCriteria4_4_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4.4/second-year-students/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_4(statusPayload, currentUserStaffId) {
  // Ensure payload has correct format for Criteria 1.1
  const payload = {
    id: statusPayload.cri44_second_year_students_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4.4/second-year-students/approval-status?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_4_Data(values) {
  const url = `/admin/nba/4.4/second-year-students`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_4_Data(cycleSubCategoryId, otherStaffId) {
   const url = `/admin/nba/4.4/second-year-students/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_4(cycleSubCategoryId) {
  const url = `/admin/nba/4.4/second-year-students/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_4Data(Id) {
  const url = `/admin/nba/4.4/second-year-students/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_4_Data(id,values) {
  const url = `/admin/nba/4.4/second-year-students/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 45  ///////////////////

function getAllCriteria4_5_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4.5/third-year-students/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_5(statusPayload, currentUserStaffId) {
  // Ensure payload has correct format for Criteria 1.1
  const payload = {
    id: statusPayload.cri45_third_year_students_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4.5/third-year-students/approval-status?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_5_Data(values) {
  // /api/admin/nba/4.5/third-year-students
  const url = `/admin/nba/4.5/third-year-students`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_5_Data(cycleSubCategoryId, otherStaffId) {
  // /api/admin/nba/4.5/third-year-students/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
   const url = `/admin/nba/4.5/third-year-students/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_5(cycleSubCategoryId) {
  const url = `/admin/nba/4.5/third-year-students/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_5Data(Id) {
  //  /api/admin/nba/4.5/third-year-students/{id}
  const url = `/admin/nba/4.5/third-year-students/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_5_Data(id,values) {
  // /api/admin/nba/4.5/third-year-students/{id}
  const url = `/admin/nba/4.5/third-year-students/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 46  ///////////////////

function getAllCriteria4_6_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4.6/higher-studies/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_6(statusPayload, currentUserStaffId) {
  // Ensure payload has correct format for Criteria 1.1
  const payload = {
    id: statusPayload.cri46_higher_studies_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4.6/higher-studies/approval-status?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_6_Data(values) {
  // /api/admin/nba/4.6/higher-studies
  const url = `/admin/nba/4.6/higher-studies`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_6_Data(cycleSubCategoryId, otherStaffId) {
  // /api/admin/nba/4.6/higher-studies/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
   const url = `/admin/nba/4.6/higher-studies/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_6(cycleSubCategoryId) {
  const url = `/admin/nba/4.6/higher-studies/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_6Data(Id) {
  //  /api/admin/nba/4.6/higher-studies/{id}
  const url = `/admin/nba/4.6/higher-studies/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_6_Data(id,values) {
  // /api/admin/nba/4.6/higher-studies/{id}
  const url = `/admin/nba/4.6/higher-studies/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

//// 47  ///////////////////

function getAllCriteria4_7_Data(cycleSubCategoryId) {
  const url = `/admin/nba/4.7/professional-activities/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus4_7(statusPayload, currentUserStaffId) {
  // Ensure payload has correct format for Criteria 1.1
  const payload = {
    id: statusPayload.cri47_professional_activities_id || statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason || null
  };
  
  const url = `/admin/nba/4.7/professional-activities/approval-status?currentUserStaffId=${currentUserStaffId}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}


function saveCriteria4_7_Data(values) {
  const url = `/admin/nba/4.7/professional-activities`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria4_7_Data(cycleSubCategoryId, otherStaffId) {
   const url = `/admin/nba/4.7/professional-activities/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails4_7(cycleSubCategoryId) {
  const url = `/admin/nba/4.7/professional-activities/cycle-subcategory/${cycleSubCategoryId}/contributors`;
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
function deleteCriteria4_7Data(Id) {
  const url = `/admin/nba/4.7/professional-activities/${Id}`;
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function putCriteria4_7_Data(id,values) {
  const url = `/admin/nba/4.7/professional-activities/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}
