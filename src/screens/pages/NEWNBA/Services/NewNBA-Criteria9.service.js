/** @format */
import {
    authHeader,
    authHeaderToPost,
    handleResponse,
    apiNBARequest,
  } from '@/_services/api';
  
  export const newnbaCriteria9Service = {
    // Criteria 9.1 - Governance Transparency
    saveCriteria9_1_Data,
    getCriteria9_1_Data,
    getAllCriteria9_1_Data,
    updateCriteria9_1Status,
    putCriteria9_1_Data,
    deleteCriteria9_1Data,
    
    // Criteria 9.2 - Institute Budget
    saveCriteria9_2_Data,
    getCriteria9_2_Data,
    getAllCriteria9_2_Data,
    updateCriteria9_2Status,
    putCriteria9_2_Data,
    deleteCriteria9_2Data,
    
    // Criteria 9.3 - Library Internet
    saveCriteria9_3_Data,
    getCriteria9_3_Data,
    getAllCriteria9_3_Data,
    updateCriteria9_3Status,
    putCriteria9_3_Data,
    deleteCriteria9_3Data,
    
    // Legacy functions for other sections (9.2, 9.4-9.14)
    getCriteria9Data,
    getAllCardDetails9,
    updateCardStatus9,
  };
  
  // ==================== CRITERIA 9.1 - GOVERNANCE TRANSPARENCY ====================
  
  /**
   * POST – Create Governance Transparency
   */
  function saveCriteria9_1_Data(currentUserStaffId, values) {
    const url = `/admin/nba/9.1/governance-transparency?currentUserStaffId=${currentUserStaffId}`;
    return apiNBARequest(url, {
      method: 'POST',
      headers: authHeaderToPost(),
      body: JSON.stringify(values),
    }).then(handleResponse);
  }
  
  /**
   * GET – Governance Transparency by Cycle Subcategory & Staff
   */
  function getCriteria9_1_Data(cycleSubCategoryId, otherStaffId) {
    const url = `/admin/nba/9.1/governance-transparency/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
    return apiNBARequest(url, {
      method: 'GET',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * GET – All Governance Transparency Contributors
   */
  function getAllCriteria9_1_Data(cycleSubCategoryId) {
    const url = `/admin/nba/9.1/governance-transparency/cycle-subcategory/${cycleSubCategoryId}/contributors`;
    return apiNBARequest(url, {
      method: 'GET',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * DELETE – Soft Delete Governance Transparency
   */
  function deleteCriteria9_1Data(id) {
    const url = `/admin/nba/9.1/governance-transparency/${id}`;
    return apiNBARequest(url, {
      method: 'DELETE',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * PUT – Update Governance Transparency
   */
  function putCriteria9_1_Data(id, currentUserStaffId, values) {
    const url = `/admin/nba/9.1/governance-transparency/${id}?currentUserStaffId=${currentUserStaffId}`;
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(values),
    }).then(handleResponse);
  }
  
  /**
   * PUT – Update Governance Transparency Approval Status
   */
  function updateCriteria9_1Status(statusPayload, approverStaffId) {
    const payload = {
      id: statusPayload.id,
      approval_status: statusPayload.approval_status,
      rejection_reason: statusPayload.rejection_reason || null,
      approved_by: approverStaffId,
      approved_by_name: statusPayload.approved_by_name || '',
    };
  
    const url = `/admin/nba/9.1/governance-transparency/approval-status?approverStaffId=${approverStaffId}`;
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
  // ==================== CRITERIA 9.2 - INSTITUTE BUDGET ====================
  
  /**
   * POST – Create Institute Budget
   */
  function saveCriteria9_2_Data(currentUserStaffId, values) {
    const url = `/admin/nba/9.2/institute-budget?currentUserStaffId=${currentUserStaffId}`;
    return apiNBARequest(url, {
      method: 'POST',
      headers: authHeaderToPost(),
      body: JSON.stringify(values),
    }).then(handleResponse);
  }
  
  /**
   * GET – Institute Budget by Cycle Subcategory & Staff
   */
  function getCriteria9_2_Data(cycleSubCategoryId, otherStaffId) {
    const url = `/admin/nba/9.2/institute-budget/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
    return apiNBARequest(url, {
      method: 'GET',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * GET – All Institute Budget Contributors
   */
  function getAllCriteria9_2_Data(cycleSubCategoryId) {
    const url = `/admin/nba/9.2/institute-budget/cycle-subcategory/${cycleSubCategoryId}/contributors`;
    return apiNBARequest(url, {
      method: 'GET',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * DELETE – Soft Delete Institute Budget
   */
  function deleteCriteria9_2Data(id) {
    const url = `/admin/nba/9.2/institute-budget/${id}`;
    return apiNBARequest(url, {
      method: 'DELETE',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * PUT – Update Institute Budget
   */
  function putCriteria9_2_Data(id, currentUserStaffId, values) {
    const url = `/admin/nba/9.2/institute-budget/${id}?currentUserStaffId=${currentUserStaffId}`;
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(values),
    }).then(handleResponse);
  }
  
  /**
   * PUT – Update Institute Budget Approval Status
   */
  function updateCriteria9_2Status(statusPayload, approverStaffId) {
    const payload = {
      id: statusPayload.id,
      approval_status: statusPayload.approval_status,
      rejection_reason: statusPayload.rejection_reason || null,
      approved_by: approverStaffId,
      approved_by_name: statusPayload.approved_by_name || '',
    };
  
    const url = `/admin/nba/9.2/institute-budget/approval-status?approverStaffId=${approverStaffId}`;
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
  // ==================== CRITERIA 9.3 - LIBRARY INTERNET ====================
  
  /**
   * POST – Create Library Internet
   */
  function saveCriteria9_3_Data(currentUserStaffId, values) {
    const url = `/admin/nba/9.3/library-internet?currentUserStaffId=${currentUserStaffId}`;
    return apiNBARequest(url, {
      method: 'POST',
      headers: authHeaderToPost(),
      body: JSON.stringify(values),
    }).then(handleResponse);
  }
  
  /**
   * GET – Library Internet by Cycle Subcategory & Staff
   */
  function getCriteria9_3_Data(cycleSubCategoryId, otherStaffId) {
    const url = `/admin/nba/9.3/library-internet/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
    return apiNBARequest(url, {
      method: 'GET',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * GET – All Library Internet Contributors
   */
  function getAllCriteria9_3_Data(cycleSubCategoryId) {
    const url = `/admin/nba/9.3/library-internet/cycle-subcategory/${cycleSubCategoryId}/contributors`;
    return apiNBARequest(url, {
      method: 'GET',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * DELETE – Soft Delete Library Internet
   */
  function deleteCriteria9_3Data(id) {
    const url = `/admin/nba/9.3/library-internet/${id}`;
    return apiNBARequest(url, {
      method: 'DELETE',
      headers: authHeader(),
    }).then(handleResponse);
  }
  
  /**
   * PUT – Update Library Internet
   */
  function putCriteria9_3_Data(id, currentUserStaffId, values) {
    const url = `/admin/nba/9.3/library-internet/${id}?currentUserStaffId=${currentUserStaffId}`;
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(values),
    }).then(handleResponse);
  }
  
  /**
   * PUT – Update Library Internet Approval Status
   */
  function updateCriteria9_3Status(statusPayload, approverStaffId) {
    const payload = {
      id: statusPayload.id,
      approval_status: statusPayload.approval_status,
      rejection_reason: statusPayload.rejection_reason || null,
      approved_by: approverStaffId,
      approved_by_name: statusPayload.approved_by_name || '',
    };
  
    const url = `/admin/nba/9.3/library-internet/approval-status?approverStaffId=${approverStaffId}`;
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
  // ==================== LEGACY FUNCTIONS FOR SECTIONS 9.2, 9.4-9.14 ====================
  
  // Get API endpoint based on section
  const getApiEndpoint = (section) => {
    const sectionMap = {
      '9.2': 'mentoring-system',
      '9.4': 'training-and-placement',
      '9.5': 'startup-entrepreneurship',
      '9.6': 'governance-transparency',
      '9.7':'institute-budget',
      '9.8':'program-budget',
      '9.9': 'learning-resources-quality',
      '9.10': 'e-governance',
      '9.11': 'sustainable-dev-goals',
      '9.12': 'innovative-educational-initiatives',
      '9.13': 'faculty-performance-appraisal',
      '9.14': 'outreach-activities'
    };
    
    return sectionMap[section] || 'mentoring-system';
  };
  
  function getCriteria9Data(section, cycleSubCategoryId, otherStaffId) {
    const endpoint = getApiEndpoint(section);
    const url = `/admin/nba/${section}/${endpoint}/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
    return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
  }
  
  function getAllCardDetails9(section, cycleSubCategoryId) {
    const endpoint = getApiEndpoint(section);
    const url = `/admin/nba/${section}/${endpoint}/cycle-subcategory/${cycleSubCategoryId}/contributors`;
    return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
  }
  
  function updateCardStatus9(section, statusPayload, approverId) {
    const endpoint = getApiEndpoint(section);
    const url = `/admin/nba/${section}/${endpoint}/approval-status?approverId=${approverId}`;
    
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(statusPayload),
    }).then(handleResponse);
  }