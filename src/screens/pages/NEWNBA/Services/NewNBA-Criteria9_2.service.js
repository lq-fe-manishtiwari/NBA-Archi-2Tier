/** @format */
import {
    authHeader,
    authHeaderToPost,
    handleResponse,
    apiNBARequest,
  } from '@/_services/api';
  
  export const newnbaCriteria9_2_Service = {
    saveCriteria9_2_Data,
    getCriteria9_2_Data,
    getAllCardDetails_9_2,
    updateCardStatus,
    updateCriteria9_2,
    deleteCriteria9_2,
  };
  
  // -------------------- API Functions --------------------
  
  function saveCriteria9_2_Data(payload) {
  //  POST /api/admin/nba/9.2/mentoring-system

    const url = `/admin/nba/9.2/mentoring-system`; // UPDATED
      
    return apiNBARequest(url, {
      method: 'POST',
      headers: authHeaderToPost(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
  function getCriteria9_2_Data(cycleSubCategoryId, otherStaffId) {
   // GET /api/admin/nba/9.2/mentoring-system/cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
    const url = `/admin/nba/9.2/mentoring-system/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`;
    return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
  }
  
  function getAllCardDetails_9_2(cycleSubCategoryId) {
   // GET /api/admin/nba/9.2/mentoring-system/cycle-subcategory/{cycleSubCategoryId}/contributors
    const url = `/admin/nba/9.2/mentoring-system/cycle-subcategory/${cycleSubCategoryId}/contributors`;
    return apiNBARequest(url, { method: 'GET', headers: authHeader() }).then(handleResponse);
  }
  
  function updateCardStatus(statusPayload, approverId) {
    //PUT /api/admin/nba/9.2/mentoring-system/approval-status?approverId={approverId}
    const url = `/admin/nba/9.2/mentoring-system/approval-status?approverId=${approverId}`;
      console.log("updateCardStatus", statusPayload);
   
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
  function updateCriteria9_2(id, payload) {
    //PUT /api/admin/nba/9.2/mentoring-system/{id}
    const url = `/admin/nba/9.2/mentoring-system/${id}`;
  
 
    return apiNBARequest(url, {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
  function deleteCriteria9_2(id) {
    //DELETE /api/admin/nba/9.2/mentoring-system/{id}
    const url = `/admin/nba/9.2/mentoring-system/${id}`;
  
    return apiNBARequest(url, { method: 'DELETE', headers: authHeader() }).then(handleResponse);
  }
  