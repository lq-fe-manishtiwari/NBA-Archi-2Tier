import { authHeader, handleResponse, apiRequest, authHeaderToFile, newapilogin } from '@/_services/api';

export const MarksEntryService = {
  uploadMarks,
  bulkSave,
  getMarksByProgramSubject,
  getMarksBySemesterSubject,
  getMarksBySubject,
  getMarksByExamName,
  getCOAttainmentBySubject,
  getCOAttainmentBySemester,
  getDirectAttainment,
  getDirectAttainmentByProgram,
  getMarksTemplate,
};

/**
 * Upload marks via Excel file
 * POST /api/obe/marks-entry/upload
 */
function uploadMarks(formData) {
  console.log("MarksEntryService.uploadMarks() sending:", formData.get("file"));

  // Use fetch directly to avoid apiRequest adding Content-Type: application/json
  // Let browser set Content-Type: multipart/form-data with boundary automatically
  const headers = authHeaderToFile();

  return fetch(`${newapilogin}/obe/marks-entry/upload`, {
    method: "POST",
    body: formData,  // FormData with binary file
    headers,         // Only auth headers, NO Content-Type
  }).then(handleResponse);
}

/**
 * Bulk save marks
 * POST /api/obe/marks/bulk-save
 */
function bulkSave(payload) {
  const url = `/obe/marks/bulk-save`;
  return apiRequest(url, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

/**
 * Get marks by program and subject
 * GET /api/obe/marks-entry/program/{programId}/subject/{subjectId}
 */
function getMarksByProgramSubject(programId, subjectId) {
  const url = `/obe/marks-entry/program/${programId}/subject/${subjectId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get marks by semester and subject
 * GET /api/obe/marks-entry/semester/{semesterId}/subject/{subjectId}
 */
function getMarksBySemesterSubject(semesterId, subjectId) {
  const url = `/obe/marks-entry/semester/${semesterId}/subject/${subjectId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get marks by subject
 * GET /api/obe/marks-entry/subject/{subjectId}
 */
function getMarksBySubject(subjectId) {
  const url = `/obe/marks-entry/subject/${subjectId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get marks by exam name
 * GET /api/obe/marks-entry/exam-name/{examName}
 */
function getMarksByExamName(examName) {
  const url = `/obe/marks-entry/exam-name/${examName}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get CO attainment by subject
 * GET /api/obe/marks-entry/co-attainment/subject/{subjectId}
 */
function getCOAttainmentBySubject(subjectId) {
  const url = `/obe/marks-entry/co-attainment/subject/${subjectId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get CO attainment by semester
 * GET /api/obe/marks-entry/co-attainment/semester/{semesterId}
 */
function getCOAttainmentBySemester(semesterId) {
  const url = `/obe/marks-entry/co-attainment/semester/${semesterId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get direct attainment by semester and program
 * GET /api/obe/direct-attainment/semester/{semesterId}/program/{programId}
 */
function getDirectAttainment(semesterId, programId) {
  const url = `/obe/direct-attainment/semester/${semesterId}/program/${programId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get direct attainment by program
 * GET /api/obe/direct-attainment/program/{programId}
 */
function getDirectAttainmentByProgram(programId) {
  const url = `/obe/direct-attainment/program/${programId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get marks entry Excel template
 * GET /api/obe/marks-entry/template
 */
function getMarksTemplate() {
  const url = `/obe/marks-entry/template`;
  return fetch(`${newapilogin}${url}`, {
    method: "GET",
    headers: authHeader(), // NO content-type, backend sets correct type
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to download template");
    }
    return res.blob(); // return binary blob
  });
}

