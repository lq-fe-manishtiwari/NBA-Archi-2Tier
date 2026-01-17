import {
  apiNBARequest,
  authHeader,
  authHeaderToPost,
  handleResponse
} from "@/_services/api";

/**
 * ======================================================
 * EXPORT SERVICE
 * ======================================================
 */
export const newnbaCriteria8Service = {

  /**
   * ========== CRITERIA 8 – STUDENT SUPPORT SYSTEM ==========
   */
  saveStudentSupportSystem,
  getStudentSupportSystemByStaff,
  getAllStudentSupportContributors,
  updateStudentSupportSystem,
  updateStudentSupportApprovalStatus,
  deleteStudentSupportSystem
};


const BASE_URL8_STUDENT_SUPPORT =
  "/admin/nba/8/new-student-support-system";

/* ======================================================
   CRITERIA 8 – STUDENT SUPPORT SYSTEM
====================================================== */
function saveStudentSupportSystem(values, currentUserStaffId) {
  return apiNBARequest(
    `${BASE_URL8_STUDENT_SUPPORT}?currentUserStaffId=${currentUserStaffId}`,
    {
      method: "POST",
      headers: authHeaderToPost(),
      body: JSON.stringify(values)
    }
  ).then(handleResponse);
}

function getStudentSupportSystemByStaff(cycleSubCategoryId, otherStaffId) {
  return apiNBARequest(
    `${BASE_URL8_STUDENT_SUPPORT}/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`,
    { method: "GET", headers: authHeader() }
  ).then(handleResponse);
}

function getAllStudentSupportContributors(cycleSubCategoryId) {
  return apiNBARequest(
    `${BASE_URL8_STUDENT_SUPPORT}/cycle-subcategory/${cycleSubCategoryId}/contributors`,
    { method: "GET", headers: authHeader() }
  ).then(handleResponse);
}

function updateStudentSupportSystem(id, values, currentUserStaffId) {
  return apiNBARequest(
    `${BASE_URL8_STUDENT_SUPPORT}/${id}?currentUserStaffId=${currentUserStaffId}`,
    {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(values)
    }
  ).then(handleResponse);
}

function updateStudentSupportApprovalStatus(payload, approverStaffId) {
  return apiNBARequest(
    `${BASE_URL8_STUDENT_SUPPORT}/approval-status?approverStaffId=${approverStaffId}`,
    {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(payload)
    }
  ).then(handleResponse);
}

function deleteStudentSupportSystem(id) {
  return apiNBARequest(`${BASE_URL8_STUDENT_SUPPORT}/${id}`, {
    method: "DELETE",
    headers: authHeader()
  }).then(handleResponse);
}

/**
 * ======================================================
 * APPROVAL STATUS CONSTANTS
 * ======================================================
 */
export const APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED_BY_SUB_COORDINATOR: "APPROVED_BY_SUB_COORDINATOR",
  APPROVED_BY_COORDINATOR: "APPROVED_BY_COORDINATOR",
  REJECTED_BY_SUB_COORDINATOR: "REJECTED_BY_SUB_COORDINATOR",
  REJECTED_BY_COORDINATOR: "REJECTED_BY_COORDINATOR",
  COORDINATORS_DATA: "COORDINATORS_DATA"
};
