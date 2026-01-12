/** @format */
import {
  authHeader,
  authHeaderToPost,
  authHeaderToFile,
  handleResponse,
  apiRequest,
  newapilogin,
} from '@/_services/api';

export const AttainmentConfigService = {
  getSurveyAttainment,
  getOverallAttainment,
  saveConfig,
  saveSurveyConfig,
  downloadSurveyTemplate,
  uploadSurveyExcel,
  getAllForSubject,
  getByAssessmentType,
  getByTool,
  deleteConfig,
  getAllConfigs,
  getExternalConfigBySubject,
  getInternalConfigBySubject,
};

/**
 * Save attainment configuration
 * POST /api/obe/attainment-config/save?subjectId=123
 */
function saveConfig(subjectId, configData) {
  const url = `/obe/attainment-config/save?subjectId=${subjectId}`;
  return apiRequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(configData),
  }).then(handleResponse);
}

/**
 * Save survey attainment configuration
 * POST /api/obe/survey/attainment-config/save
 */
function saveSurveyConfig(configData) {
  const url = `/obe/survey/attainment-config/save`;
  return apiRequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(configData),
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  });
}

/**
 * Get all configurations for a subject
 * GET /api/obe/attainment-config/subject/123
 */
function getAllForSubject(subjectId) {
  const url = `/obe/attainment-config/subject/${subjectId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get configurations by assessment type
 * GET /api/obe/attainment-config/subject/123/type/CIA
 */
function getByAssessmentType(subjectId, assessmentType) {
  const url = `/obe/attainment-config/subject/${subjectId}/type/${assessmentType}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get configurations by tool
 * GET /api/obe/attainment-config/subject/123/tool/Quiz
 */
function getByTool(subjectId, tool) {
  const url = `/obe/attainment-config/subject/${subjectId}/tool/${tool}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Delete configuration
 * DELETE /api/obe/attainment-config/25
 */
function deleteConfig(configId) {
  const url = `/obe/attainment-config/${configId}`;
  return apiRequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Admin: Get all configurations
 * GET /api/obe/attainment-config/all
 */
function getAllConfigs() {
  const url = `/obe/attainment-config/all`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get external tools config by subject ID
 * GET /api/obe/external-config/subject/{subjectId}
 */
function getExternalConfigBySubject(subjectId) {
  const url = `/obe/external-config/subject/${subjectId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get internal tools config by subject ID
 * GET /api/obe/internal-config/subject/{subjectId}
 */
function getInternalConfigBySubject(subjectId) {
  const url = `/obe/internal-config/subject/${subjectId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getSurveyAttainment(programId,academicYearId) {
  // obe/survey/attainment/all/{programId}/{academicYearId}
  const url = `/obe/survey/attainment/all/${programId}/${academicYearId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function getOverallAttainment(programId, academicYearId) {
  const url = `/obe/overall-attainment/program/${programId}/year/${academicYearId}`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Download program exit survey template
 * GET /api/obe/excel/download-program-exit-survey-template
 */
function downloadSurveyTemplate() {
  const url = `/obe/excel/download-program-exit-survey-template`;
  return apiRequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => response.blob());
}

/**
 * Upload custom survey excel
 * POST /api/obe/excel/upload-custom-survey
 */
function uploadSurveyExcel(formData) {
  const headers = authHeaderToFile();

  return fetch(`${newapilogin}/obe/excel/upload-custom-survey`, {
    method: 'POST',
    body: formData,
    headers,
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  });
}