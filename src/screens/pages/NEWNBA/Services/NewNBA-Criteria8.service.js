import {
  apiNBARequest,
  authHeader,
  authHeaderToPost,
  handleResponse
} from "@/_services/api";

export const newnbaCriteria8Service = {
  /**
   * ========== CRITERIA 8.1 (CO / PO / PSO ACTIONS) ==========
   */
  saveCriteria8_1_Data,
  getCriteria8_1_Data,
  getallCardDetails8_1,
  updateCardStatus8_1,
  updateData8_1,
  deleteData8_1,

  /**
   * ========== CRITERIA 8.2 (ACADEMIC AUDIT) ==========
   */
  saveCriteria8_2_Data,
  getCriteria8_2_Data,
  getallCardDetails8_2,
  updateCardStatus8_2,
  updateData8_2,
  deleteData8_2,

  /**
   * ========== CRITERIA 8.3 (FACULTY QUALIFICATION IMPROVEMENT) ==========
   */
  saveCriteria8_3_Data,
  getCriteria8_3_Data,
  getallCardDetails8_3,
  updateCardStatus8_3,
  updateData8_3,
  deleteData8_3,

  /**
   * ========== CRITERIA 8.4 (ADDITIONAL CRITERIA) ==========
   */
  saveCriteria8_4_Data,
  getCriteria8_4_Data,
  getallCardDetails8_4,
  updateCardStatus8_4,
  updateData8_4,
  deleteData8_4
};

/**
 * ================= BASE URLs =================
 */
const BASE_URL8_1 = "/admin/nba/8.1/co-po-pso-actions";
const BASE_URL8_2 = "/admin/nba/8.2/academic-audit";
const BASE_URL8_3 = "/admin/nba/8.3/faculty-qualification-improvement";
const BASE_URL8_4 = "/admin/nba/8.4/academic-performance-improvement"; 

/* ======================================================
   ✅ CRITERIA 8.1 – CO / PO / PSO ACTIONS
====================================================== */

/**
 * CREATE
 */
function saveCriteria8_1_Data(values) {
  return apiNBARequest(BASE_URL8_1, {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  }).then(handleResponse);
}

/**
 * GET – Staff wise data
 */
function getCriteria8_1_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `${BASE_URL8_1}/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    {
      method: "GET",
      headers: authHeader()
    }
  ).then(handleResponse);
}

/**
 * GET – Contributor cards (Coordinator / Sub-Coordinator view)
 */
function getallCardDetails8_1(cycleSubCategoryId) {
  return apiNBARequest(
    `${BASE_URL8_1}/cycle-subcategory/${cycleSubCategoryId}/contributors`,
    {
      method: "GET",
      headers: authHeader()
    }
  ).then(handleResponse);
}

/**
 * UPDATE DATA
 */
function updateData8_1(id, values) {
  return apiNBARequest(`${BASE_URL8_1}/${id}`, {
    method: "PUT",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  }).then(handleResponse);
}

/**
 * UPDATE APPROVAL STATUS
 * approverId REQUIRED in query param
 */
function updateCardStatus8_1(requestPayload, approverId) {
  return apiNBARequest(
    `${BASE_URL8_1}/approval-status?approverId=${approverId}`,
    {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(requestPayload)
    }
  ).then(handleResponse);
}

/**
 * DELETE (Soft delete)
 */
function deleteData8_1(id) {
  return apiNBARequest(`${BASE_URL8_1}/${id}`, {
    method: "DELETE",
    headers: authHeader()
  }).then(handleResponse);
}

/* ======================================================
   ✅ CRITERIA 8.2 – ACADEMIC AUDIT
====================================================== */

/**
 * CREATE Academic Audit Data
 */
function saveCriteria8_2_Data(values) {
  return apiNBARequest(BASE_URL8_2, {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  }).then(handleResponse);
}

/**
 * GET – Staff wise Academic Audit data
 */
function getCriteria8_2_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `${BASE_URL8_2}/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    {
      method: "GET",
      headers: authHeader()
    }
  ).then(handleResponse);
}

/**
 * GET – Contributor cards for Academic Audit (Coordinator / Sub-Coordinator view)
 */
function getallCardDetails8_2(cycleSubCategoryId) {
  return apiNBARequest(
    `${BASE_URL8_2}/cycle-subcategory/${cycleSubCategoryId}/contributors`,
    {
      method: "GET",
      headers: authHeader()
    }
  ).then(handleResponse);
}

/**
 * UPDATE Academic Audit Data
 */
function updateData8_2(id, values) {
  return apiNBARequest(`${BASE_URL8_2}/${id}`, {
    method: "PUT",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  }).then(handleResponse);
}

/**
 * UPDATE APPROVAL STATUS for Academic Audit
 * approverId REQUIRED in query param
 */
function updateCardStatus8_2(requestPayload, approverId) {
  return apiNBARequest(
    `${BASE_URL8_2}/approval-status?approverId=${approverId}`,
    {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(requestPayload)
    }
  ).then(handleResponse);
}

/**
 * DELETE Academic Audit Data (Soft delete)
 */
function deleteData8_2(id) {
  return apiNBARequest(`${BASE_URL8_2}/${id}`, {
    method: "DELETE",
    headers: authHeader()
  }).then(handleResponse);
}

/* ======================================================
   ✅ CRITERIA 8.3 – FACULTY QUALIFICATION IMPROVEMENT
====================================================== */

/**
 * CREATE Faculty Qualification Improvement Data
 */
function saveCriteria8_3_Data(values) {
  return apiNBARequest(BASE_URL8_3, {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  }).then(handleResponse);
}

/**
 * GET – Staff wise Faculty Qualification Improvement data
 */
function getCriteria8_3_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `${BASE_URL8_3}/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    {
      method: "GET",
      headers: authHeader()
    }
  ).then(handleResponse);
}

/**
 * GET – Contributor cards for Faculty Qualification Improvement (Coordinator / Sub-Coordinator view)
 */
function getallCardDetails8_3(cycleSubCategoryId) {
  return apiNBARequest(
    `${BASE_URL8_3}/cycle-subcategory/${cycleSubCategoryId}/contributors`,
    {
      method: "GET",
      headers: authHeader()
    }
  ).then(handleResponse);
}

/**
 * UPDATE Faculty Qualification Improvement Data
 */
function updateData8_3(id, values) {
  return apiNBARequest(`${BASE_URL8_3}/${id}`, {
    method: "PUT",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  }).then(handleResponse);
}

/**
 * UPDATE APPROVAL STATUS for Faculty Qualification Improvement
 * approverId REQUIRED in query param
 */
function updateCardStatus8_3(requestPayload, approverId) {
  return apiNBARequest(
    `${BASE_URL8_3}/approval-status?approverId=${approverId}`,
    {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(requestPayload)
    }
  ).then(handleResponse);
};

/**
 * DELETE Faculty Qualification Improvement Data (Soft delete)
 */
function deleteData8_3(id) {
  return apiNBARequest(`${BASE_URL8_3}/${id}`, {
    method: "DELETE",
    headers: authHeader()
  }).then(handleResponse);
}

/* ======================================================
   ✅ CRITERIA 8.4 – ADDITIONAL CRITERIA
====================================================== */

/**
 * CREATE Criteria 8.4 Data
 */
function saveCriteria8_4_Data(values) {
  return apiNBARequest(BASE_URL8_4, {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  }).then(handleResponse);
}

/**
 * GET – Staff wise Criteria 8.4 data
 */
function getCriteria8_4_Data(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `${BASE_URL8_4}/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    {
      method: "GET",
      headers: authHeader()
    }
  ).then(handleResponse);
}

/**
 * GET – Contributor cards for Criteria 8.4 (Coordinator / Sub-Coordinator view)
 */
function getallCardDetails8_4(cycleSubCategoryId) {
  return apiNBARequest(
    `${BASE_URL8_4}/cycle-subcategory/${cycleSubCategoryId}/contributors`,
    {
      method: "GET",
      headers: authHeader()
    }
  ).then(handleResponse);
}

/**
 * UPDATE Criteria 8.4 Data
 */
function updateData8_4(id, values) {
  return apiNBARequest(`${BASE_URL8_4}/${id}`, {
    method: "PUT",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  }).then(handleResponse);
}

/**
 * UPDATE APPROVAL STATUS for Criteria 8.4
 * approverId REQUIRED in query param
 */
function updateCardStatus8_4(requestPayload, approverId) {
  return apiNBARequest(
    `${BASE_URL8_4}/approval-status?approverId=${approverId}`,
    {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(requestPayload)
    }
  ).then(handleResponse);
}

/**
 * DELETE Criteria 8.4 Data (Soft delete)
 */
function deleteData8_4(id) {
  return apiNBARequest(`${BASE_URL8_4}/${id}`, {
    method: "DELETE",
    headers: authHeader()
  }).then(handleResponse);
}

/**

 */
export const APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED_BY_SUB_COORDINATOR: "APPROVED_BY_SUB_COORDINATOR",
  APPROVED_BY_COORDINATOR: "APPROVED_BY_COORDINATOR",
  REJECTED_BY_SUB_COORDINATOR: "REJECTED_BY_SUB_COORDINATOR",
  REJECTED_BY_COORDINATOR: "REJECTED_BY_COORDINATOR",
  COORDINATORS_DATA: "COORDINATORS_DATA"
};