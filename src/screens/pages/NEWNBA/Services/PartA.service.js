import { apiNBARequest, authHeader, authHeaderToPost, handleResponse } from '@/_services/api';

export const partAService = {
  getPrequalifierCombinedData,
  // New Institute Information API methods
  getInstituteInformation,
  saveInstituteInformation,
  updateInstituteInformation,
  deleteInstituteInformation,
}

// Legacy method - keeping for backward compatibility
function getPrequalifierCombinedData(partAId, collegeId, programId) {
  // admin/nba/part-a/14/prequalifier-combined?collegeId=1&programId=51
  return apiNBARequest(`${'/admin/nba/part-a'}/${partAId}/prequalifier-combined?collegeId=${collegeId}&programId=${programId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

// New Institute Information API methods

/**
 * Get Institute Information by partAId, collegeId, and programId
 * @param {number} partAId - The cycle ID (nba_accredited_program_id)
 * @param {number} collegeId - The college ID
 * @param {number} programId - The program ID
 * @returns {Promise} API response with institute information
 */
function getInstituteInformation(partAId, collegeId, programId) {
  return apiNBARequest(`/nba/institute-information/${partAId}/${collegeId}/${programId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Save new Institute Information
 * @param {Object} instituteData - The institute information data
 * @returns {Promise} API response
 */
function saveInstituteInformation(instituteData) {
  return apiNBARequest('/nba/institute-information', {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(instituteData),
  }).then(handleResponse);
}

/**
 * Update existing Institute Information
 * @param {number} partAId - The cycle ID (nba_accredited_program_id)
 * @param {number} collegeId - The college ID
 * @param {number} programId - The program ID
 * @param {Object} instituteData - The updated institute information data
 * @returns {Promise} API response
 */
function updateInstituteInformation(partAId, collegeId, programId, instituteData) {
  return apiNBARequest(`/nba/institute-information/${partAId}/${collegeId}/${programId}`, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(instituteData),
  }).then(handleResponse);
}

/**
 * Delete Institute Information
 * @param {number} partAId - The cycle ID (nba_accredited_program_id)
 * @param {number} collegeId - The college ID
 * @param {number} programId - The program ID
 * @returns {Promise} API response
 */
function deleteInstituteInformation(partAId, collegeId, programId) {
  return apiNBARequest(`/nba/institute-information/${partAId}/${collegeId}/${programId}`, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(response => {
    // Handle plain text response for delete operation
    if (response.ok) {
      return response.text(); // Return plain text instead of trying to parse as JSON
    }
    return handleResponse(response); // Use normal JSON handling for errors
  });
}