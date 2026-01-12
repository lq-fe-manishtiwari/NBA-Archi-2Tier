import { apiNBARequest, authHeader, authHeaderToPost, handleResponse } from '@/_services/api';

export const ReportService = {
  getReportPARTAInstiInfo,
  getReportCri1,
  getReportCri2,
  getReportCri3,
  getReportCri4,
  getReportCri5,
  getReportCri6,
  getReportCri7,
  getReportCri8,
  getReportCri9,

}
function getReportPARTAInstiInfo(cycleID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/report/institute-information/${cycleID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri1(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion1?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri2(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion2?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri3(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion3?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri4(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion4?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri5(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion5?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri6(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion6?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri7(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion7?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri8(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion8?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}

function getReportCri9(cyclesubcategoryID) {
  
  // Use fetch directly to handle the blob response, instead of .then(handleResponse) which expects JSON.
  return apiNBARequest(`/admin/nba/report/criterion9?cycleSubCategoryIds=${cyclesubcategoryID}`, {
    method: 'GET',
    headers: authHeader(),
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok.');
    return response; // Return the raw response object to be handled as a blob in the component
  });
}