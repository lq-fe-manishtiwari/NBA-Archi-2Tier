/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
  AcademicAPI,
} from '@/_services/api';


export const newnbaCriteria7Service = {
  // Innovation Lab CRUD APIs
  saveCriteria7_1_Data,
  getCriteria7_1_Data,
  getallCardDetails,
  updateCardStatus,
  updateInnovationLab,
  deleteInnovationLab,
  
  // Generic methods for dynamic calling from CriterionForm7
  getCriteria7_1_Data: getCriteria7_1_Data,
  saveCriteria7_1_Data: saveCriteria7_1_Data,
};

/**
 * Save Innovation Lab data
 * @param {Object} payload - The innovation lab data
 * @param {number} payload.cycleSubCategoryId - The cycle sub category ID
 * @param {number} payload.otherStaffId - The staff ID (coordinator or contributor)
 * @param {string} payload.innovationLabDetails - Details about the innovation lab
 * @param {Array} payload.innovationLabProjectTable - Project table data
 * @param {Array} payload.innovationLabStartupTable - Startup table data
 * @param {Array} payload.innovationLabDocument - Document data
 */
function saveCriteria7_1_Data(payload) {
  
  
  const url = `/admin/nba/innovation-lab`;
  
  
  // Convert to snake_case format for backend
  const requestPayload = {
    cycle_sub_category_id: payload.cycleSubCategoryId,
    other_staff_id: payload.otherStaffId,
    innovation_lab_details: payload.innovationLabDetails || '',
    innovation_lab_project_table: payload.innovationLabProjectTable || [],
    innovation_lab_startup_table: payload.innovationLabStartupTable || [],
    innovation_lab_document: payload.innovationLabDocument || [],
    is_coordinator_entry: payload.isCoordinatorEntry || false // Flag to identify coordinator entries
  };

  

  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(response => {
    return handleResponse(response);
  }).catch(error => {
    throw error;
  });
}

/**
 * Get Innovation Lab data for specific cycle sub category and staff
 * @param {number} cycleSubCategoryId - The cycle sub category ID
 * @param {number} otherStaffId - The staff ID
 */
function getCriteria7_1_Data(cycleSubCategoryId, otherStaffId) {
  const url = `/admin/nba/innovation-lab/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Get all card details for contributors in a specific cycle sub category
 * Used by coordinator to see all allocated contributors and their status
 * @param {number} cycleSubCategoryId - The cycle sub category ID
 */
function getallCardDetails(cycleSubCategoryId) {
  const url = `/admin/nba/innovation-lab/cycle-subcategory/${cycleSubCategoryId}/contributors`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

/**
 * Update approval status of innovation lab entry
 * @param {Object} statusPayload - The status update payload
 * @param {number} statusPayload.innovationLabId - The innovation lab entry ID
 * @param {string} statusPayload.approvalStatus - PENDING, APPROVED, or REJECTED
 * @param {string} statusPayload.rejectionReason - Required when status is REJECTED
 * @param {number} statusPayload.approvedBy - ID of the approver
 * @param {string} statusPayload.approvedByName - Name of the approver
 */
function updateCardStatus(statusPayload,otherStaffId) {
  console.log("statusPayload", statusPayload);
  const url = `/admin/nba/innovation-lab/approval-status?approverId=${otherStaffId}`;
  
  // Validate required fields
  if (!statusPayload.id || !statusPayload.approval_status) {
    throw new Error('Innovation Lab ID and approval status are required');
  }
  
  // Validate reason when status is REJECTED or APPROVED
  if (statusPayload.approval_status === 'REJECTED' && !statusPayload.rejection_reason) {
    throw new Error('Rejection reason is required when status is REJECTED');
  }

  // Convert to snake_case format for backend
  // Use rejection_reason field for both approval and rejection reasons
  const requestPayload = {
    innovation_lab_id: statusPayload.id,
    approval_status: statusPayload.approval_status,
    rejection_reason: statusPayload.rejection_reason,
    // rejection_reason: statusPayload.rejection_reason || statusPayload.approvalReason,
    approved_by: statusPayload.approved_by,
    approved_by_name: statusPayload.approved_by_name
  };

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

/**
 * Update Innovation Lab data by ID
 * @param {number} innovationLabId - The innovation lab entry ID
 * @param {Object} payload - The updated innovation lab data
 */
function updateInnovationLab(innovationLabId, payload) {
  
  
  if (!innovationLabId) {
    throw new Error("Innovation Lab ID is required for update");
  }
  
  const url = `/admin/nba/innovation-lab/${innovationLabId}`;
  
  
  // Convert to snake_case format for backend
  const requestPayload = {
    cycle_sub_category_id: Number(payload.cycleSubCategoryId),
    other_staff_id: payload.otherStaffId,
    innovation_lab_details: payload.innovationLabDetails || '',
    innovation_lab_project_table: payload.innovationLabProjectTable || [],
    innovation_lab_startup_table: payload.innovationLabStartupTable || [],
    innovation_lab_document: payload.innovationLabDocument || [],
    approval_status: payload.approval_status ,// Default to PENDING if not provided
  };

  

  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(response => {
    return handleResponse(response);
  }).catch(error => {
    throw error;
  });
}

/**
 * Delete Innovation Lab entry by ID
 * @param {number} innovationLabId - The innovation lab entry ID to delete
 */
function deleteInnovationLab(innovationLabId) {
  
  
  if (!innovationLabId) {
    
    throw new Error("Innovation Lab ID is required for deletion");
  }
  
  const url = `/admin/nba/innovation-lab/${innovationLabId}`;
  
  return apiNBARequest(url, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(response => {
    
    return handleResponse(response);
  }).catch(error => {
    
    console.error("💥 DELETE Error details:", error.message);
    console.error("💥 DELETE Error stack:", error.stack);
    
    // Log additional error context
    if (error.response) {
      console.error("💥 DELETE Response error:", error.response);
      console.error("💥 DELETE Response status:", error.response.status);
      console.error("💥 DELETE Response data:", error.response.data);
    } else if (error.request) {
      console.error("💥 DELETE Request error:", error.request);
    }
    
    throw error;
  });
}

// Export individual functions for backward compatibility
export {
  saveCriteria7_1_Data,
  getCriteria7_1_Data,
  getallCardDetails,
  updateCardStatus,
  updateInnovationLab,
  deleteInnovationLab
};