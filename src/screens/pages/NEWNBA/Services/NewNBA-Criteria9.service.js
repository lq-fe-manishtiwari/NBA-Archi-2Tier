/** @format */
import {
    authHeader,
    authHeaderToPost,
    handleResponse,
    apiNBARequest,
  } from '@/_services/api';
  
  export const newnbaCriteria9Service = {
    saveCriteria9Data,
    getCriteria9Data,
    getAllCardDetails9,
    updateCardStatus9,
    updateCriteria9,
    deleteCriteria9,
  };
  
  // -------------------- DYNAMIC API Functions --------------------
  
  // Get API endpoint based on section
  const getApiEndpoint = (section) => {
    const sectionMap = {
      '9.1':'first-year-sfr',
      '9.2': 'mentoring-system',
      '9.3': 'student-feedback-analysis',
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
    
    return sectionMap[section] || 'mentoring-system'; // fallback to 9.2
  };
  
  function saveCriteria9Data(section, payload) {
    const endpoint = getApiEndpoint(section);
    const url = `/admin/nba/${section}/${endpoint}`;
      
    return apiNBARequest(url, {
      method: 'POST',
      headers: authHeaderToPost(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
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
  
  function updateCriteria9(section, id, payload) {
    const endpoint = getApiEndpoint(section);
    const url = `/admin/nba/${section}/${endpoint}/${id}`;
  
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
  function deleteCriteria9(section, id) {
    const endpoint = getApiEndpoint(section);
    const url = `/admin/nba/${section}/${endpoint}/${id}`;
  
    return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
  }