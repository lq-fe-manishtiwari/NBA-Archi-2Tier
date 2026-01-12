/** @format */

import {
  authHeader,
  handleResponse,
  authHeaderToPost,
  handleFileResponse,
  authHeaderToFile,
  authHeaderToDowmloadReport,
} from "@/_helpers";
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
} from '@/_services/api';
import { authenticationService } from "@/_services";

export const nbaPrequalifierService = {

  //newnba apis
  saveNBAPrequalifierPartA,

  savePrequalifier,
  getPrequalifier,
  deletePrequalifier,

  getPrequalifierPartB,
  savePrequalifierPartB,
  deletePrequalifierPartB,
  getPrequalifierPartBdata,
  getCategoryNBA,
  getSubCategory,
  getNBAAcademicYear,
  getNBAProgram,
  getNBAReportType,

//   saveAccrediatedProgram,
  getAccrediatedProgramByID,
  getCriteriaByAccrediatedprogramid,
  getCriteriaByAccrediatedprogramidAndSubLevel1,
  
};

function saveNBAPrequalifierPartA(values) {
  const url = `/nba/prequalifier`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}












function getPrequalifierPartB(criteriaSubLevel2Id) {
  // GET :: /api/nba/new/pre-qualifier/program-department-allied/{criteriaSubLevel2Id}
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/new/pre-qualifier/program-department-allied/${criteriaSubLevel2Id}`,
    requestOptions
  ).then(handleResponse);
}

function getPrequalifierPartBdata(criteriaSubLevel2Id) {
  // GET ::  /api/nba/new/pre-qualifier/part-b/program/{criteriaId}
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/new/pre-qualifier/part-b/program/${criteriaSubLevel2Id}`,
    requestOptions
  ).then(handleResponse);
}
function savePrequalifierPartB(criteriaSubLevel2Id,values) {
  // POST - :  /api/nba/new/pre-qualifier/part-b/program/{criteriaId}
  const requestOptions = {
    method: "POST",
    headers: {
      ...authHeaderToPost(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/new/pre-qualifier/part-b/program/${criteriaSubLevel2Id}`,
    requestOptions
  )
    .then(handleResponse)
    .then((result) => {
      return result;
    });
}

function deletePrequalifierPartB(id) {
  //  DELETE:  /api/nba/new/pre-qualifier/part-b/program/{programInfoId}
  let req = `nba/new/pre-qualifier/part-b/program/${id}`;

  const requestOptions = {
    method: "DELETE",
    headers: authHeader(),
  };
  return fetch(
    `${authenticationService.currentBackendAPI}/${req}`,
    requestOptions
  ).then(handleResponse);
}
function getAccrediatedProgramByID(instituteTypeId) {
  // GET :/api/nba-accredited-programs/grade/{gradeId}
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba-accredited-programs/grade/${instituteTypeId}`,
    requestOptions
  ).then(handleResponse);
}


function getCategoryNBA() {
  // GET : /nba/categories/get
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/categories/get`,
    requestOptions
  ).then(handleResponse);
}

function getSubCategory(categoryId) {
  // GET=nba/subcategories/category/{categoryId}
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/subcategories/category/${categoryId}`,
    requestOptions
  ).then(handleResponse);
}

function getNBAAcademicYear() {
  // GET : /api/nba/academic-year
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/academic-year`,
    requestOptions
  ).then(handleResponse);
}

function savePrequalifier(criteriaSubLevel2Id,values) {
  // POST - : /api/nba/new/pre-qualifier/part-a/institute/{criteriaSubLevel2Id}
  const requestOptions = {
    method: "POST",
    headers: {
      ...authHeaderToPost(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/new/pre-qualifier/part-a/institute/${criteriaSubLevel2Id}`,
    requestOptions
  )
    .then(handleResponse)
    .then((result) => {
      return result;
    });
}

function getPrequalifier(criteriaSubLevel2Id) {
  // POST - : /api/nba/new/pre-qualifier/part-a/institute/{criteriaSubLevel2Id}
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/new/pre-qualifier/part-a/institute/${criteriaSubLevel2Id}`,
    requestOptions
  )
    .then(handleResponse)
    .then((result) => {
      return result;
    });
}
function deletePrequalifier(id) {
  //  DELETE: /api/nba/new/pre-qualifier/part-a/institute/{profileId}
  let req = `nba/new/pre-qualifier/part-a/institute/${id}`;

  const requestOptions = {
    method: "DELETE",
    headers: authHeader(),
  };
  return fetch(
    `${authenticationService.currentBackendAPI}/${req}`,
    requestOptions
  ).then(handleResponse);
}
function getNBAProgram(subCategoryId) {
  // GET : /api//api/nba/programs/subcategory/{subCategoryId}
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/programs/subcategory/${subCategoryId}`,
    requestOptions
  ).then(handleResponse);
}
function getNBAReportType() {
  // GET : "/api/nba/nba-report"

  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/nba-report`,
    requestOptions
  ).then(handleResponse);
}

function getCriteriaByAccrediatedprogramid(nbaAccreditedProgramId) {
  //Get= /api/nba/nba-criteria/accredited-program/{accreditedProgramId}
    const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/nba-criteria/accredited-program/${nbaAccreditedProgramId}`,
    requestOptions
  ).then(handleResponse);
}
function getCriteriaByAccrediatedprogramidAndSubLevel1(nbaCriteriaId) {
  //Get= //api/nba/nba-criteria-sub-level1/nba-criteria/{nbaCriteriaId}
  
    const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/nba-criteria-sub-level1/nba-criteria/${nbaCriteriaId}`,
    requestOptions
  ).then(handleResponse);
}