// src/Services/NewNBA-Criteria5.service.js

import { apiNBARequest, authHeader, authHeaderToPost, handleResponse } from '@/_services/api';

export const newnbaCriteria6Service = {

  // Criteria 6.1 - Professional Development CRUD APIs
  saveCriteria6_1_Data,
  getCriteria6_1_Data,
  getallCardDetails6_1,
  updateCardStatus6_1,
  updateData6_1,
  deleteData6_1,

  // Criteria 6.2 - Development Activities CRUD APIs
  saveCriteria6_2_Data,
  getCriteria6_2_Data,
  getallCardDetails6_2,
  updateCardStatus6_2,
  updateData6_2,
  deleteData6_2
};

const BASE_URL6_1 = '/admin/nba/6.1/professional-development';
const BASE_URL6_2 = '/admin/nba/6.2/development-activities';

function saveCriteria6_1_Data(values) {
  // /admin/nba/6.1/professional-development
  const url = `${BASE_URL6_1}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria6_1_Data(cycleSubCategoryId,otherStaffId) {
  // /cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
  return apiNBARequest(`${BASE_URL6_1}/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function  deleteData6_1(id) {
  // /admin/nba/6.1/professional-development/{id}
  return apiNBARequest(`${BASE_URL6_1}/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails6_1(cycleSubCategoryId) {
  // /admin/nba/6.1/professional-development/cycle-subcategory/{cycleSubCategoryId}/contributors
  return apiNBARequest(`${BASE_URL6_1}/cycle-subcategory/${cycleSubCategoryId}/contributors`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus6_1(requestPayload) {
   // /admin/nba/6.1/professional-development/approval-status
 return apiNBARequest(`${BASE_URL6_1}/approval-status?approverId=${requestPayload.approved_by}`, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function updateData6_1(id, values) {
  return apiNBARequest(`${BASE_URL6_1}/${id}`, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}






function saveCriteria6_2_Data(values) {
  // /admin/nba/6.2/development-activities
  const url = `${BASE_URL6_2}`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function getCriteria6_2_Data(cycleSubCategoryId,otherStaffId) {
  // /cycle-subcategory/{cycleSubCategoryId}/staff/{otherStaffId}
  return apiNBARequest(`${BASE_URL6_2}/cycle-subcategory/${cycleSubCategoryId}/staff/${otherStaffId}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function  deleteData6_2(id) {
  // /admin/nba/6.2/development-activities/{id}
  return apiNBARequest(`${BASE_URL6_2}/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
}

function getallCardDetails6_2(cycleSubCategoryId) {
  // /admin/nba/6.2/development-activities/cycle-subcategory/{cycleSubCategoryId}/contributors
  return apiNBARequest(`${BASE_URL6_2}/cycle-subcategory/${cycleSubCategoryId}/contributors`, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}

function updateCardStatus6_2(requestPayload) {
   // /admin/nba/6.2/development-activities/approval-status
 return apiNBARequest(`${BASE_URL6_2}/approval-status?approverId=${requestPayload.approved_by}`, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(requestPayload),
  }).then(handleResponse);
}

function updateData6_2(id, values) {
 return apiNBARequest(`${BASE_URL6_2}/${id}`, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}
