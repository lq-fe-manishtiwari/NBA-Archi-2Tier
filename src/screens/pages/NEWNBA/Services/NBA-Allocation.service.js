/** @format */
// import config from "config";
import {
	authHeader,
	handleResponse,
	authHeaderToPost,
	TeacherLoginAPI,
  } from '@/_services/api';
import { authenticationService } from "@/_services/api";

export const nbaAllocationService = {

    getNBAFUserSubCoordinator,
    getAllAllocatedListing,
    // Subcoardinator allocation and deallocation 
    getNBAAllocatedUsersBySublevel1ID,
    saveNBAAllocatedUsersBySUblevel1ID,
    deleteCoordinatorAllocationBySublevel1ID,


    // Contributor Allocation and deallocation 
    getNBAAllocatedContributorBySublevel2ID,
    getNBAUserSubContributor,
    saveNBAAllocatedUsersBySUblevel2IDContributor,
    deleteNBAAllocatedUsersBySUblevel2IDContributor,
    getAllAllocatedListingContributor,
    getnbaAllocatedUsersBynbaSublevel2id
};
function getNBAFUserSubCoordinator(gradeId) {
    // /api/nba/contributor-allocation-sub-coordinator/grade/{gradeId}
    let req = `nba/contributor-allocation-sub-coordinator/grade/${gradeId}`;  
    const requestOptions = { method: "GET", headers: authHeader() };
    return fetch(
      `${authenticationService.currentBackendAPI}/${req}`,
      requestOptions
    ).then(handleResponse);
  }

  function getAllAllocatedListing(schoolUserId) {
    // /api/nba/contributor-allocation/sub-coordinator/school-user/{schoolUserId}
    const requestOptions = { method: "GET", headers: authHeader() };
    return fetch(
      `${authenticationService.currentBackendAPI}/nba/contributor-allocation/sub-coordinator/school-user/${schoolUserId}`,
      requestOptions
    ).then(handleResponse);
  }
  function getNBAAllocatedUsersBySublevel1ID(nbaCriteriaSubLevel1Id, year) {
    // [GET] :   /api/nba/contributor-allocation/sub-coordinator/{nbaCriteriaSubLevel1Id}
    let req = `nba/contributor-allocation/sub-coordinator/nba-criteria-sub-level1/${nbaCriteriaSubLevel1Id}`;
   
    const requestOptions = { method: "GET", headers: authHeader() };
    return fetch(
      `${authenticationService.currentBackendAPI}/${req}`,
      requestOptions
    ).then(handleResponse);
  }
function saveNBAAllocatedUsersBySUblevel1ID(nbaCriteriaSubLevel1Id,schoolUserId,values ) {
    // /api/nba/contributor-allocation/sub-coordinator/{nbaCriteriaSubLevel1Id}/school-user/{schoolUserId}
    const requestOptions = {
      method: "POST",
      headers: authHeaderToPost(),
      body: JSON.stringify(values),
    };
    return fetch(
      `${authenticationService.currentBackendAPI}/nba/contributor-allocation/sub-coordinator/${nbaCriteriaSubLevel1Id}/school-user/${schoolUserId}`,
      requestOptions
    )
      .then(handleResponse)
      .then((result) => {
        return result;
      });
}
function deleteCoordinatorAllocationBySublevel1ID(nbaCriteriaSubLevel1Id,schoolUserId) {
///api/nba/contributor-allocation/deallocate-sub-coordinator/{nbaCriteriaSubLevel1Id}/school-user/{schoolUserId}
  let req = `nba/contributor-allocation/deallocate-sub-coordinator/${nbaCriteriaSubLevel1Id}/school-user/${schoolUserId}`;

  const requestOptions = {
    method: "DELETE",
    headers: authHeader(),
  };
  return fetch(
    `${authenticationService.currentBackendAPI}/${req}`,
    requestOptions
  ).then(handleFileResponse);
} 

// Contributor allocation and deallocation 
function getNBAAllocatedContributorBySublevel2ID(nbaCriteriaSubLevel2Id, year) {
  // [GET] :  /api/nba/contributor-allocation/nba-criteria-sub-level2/{nbaCriteriaSubLevel2Id}
  let req = `nba/contributor-allocation/nba-criteria-sub-level2/${nbaCriteriaSubLevel2Id}`;
 
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/${req}`,
    requestOptions
  ).then(handleResponse);
}


function getNBAUserSubContributor(gradeId) {
  ///api/nba/contributor-allocation/grade/{gradeId}
  let req = `nba/contributor-allocation/grade/${gradeId}`;  
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/${req}`,
    requestOptions
  ).then(handleResponse);
}



function saveNBAAllocatedUsersBySUblevel2IDContributor(nbaCriteriaSubLevel2Id,schoolUserId,values ) {
  // /api/nba/contributor-allocation/nba-criteria-sub-level2/{nbaCriteriaSubLevel2Id}/school-user/{schoolUserId}	
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/contributor-allocation/nba-criteria-sub-level2/${nbaCriteriaSubLevel2Id}/school-user/${schoolUserId}`,
    requestOptions
  )
    .then(handleResponse)
    .then((result) => {
      return result;
    });
}
function deleteNBAAllocatedUsersBySUblevel2IDContributor(nbaCriteriaSubLevel1Id,nbaCriteriaSubLevel2Id,schoolUserId) {
///api/nba/contributor-allocation/deallocate-contributor/{nbaCriteriaSubLevel1Id}/sub-level1/{nbaCriteriaSubLevel2Id}/school-user/{schoolUserId}
let req = `nba/contributor-allocation/deallocate-contributor/${nbaCriteriaSubLevel1Id}/sub-level1/${nbaCriteriaSubLevel2Id}/school-user/${schoolUserId}`;

const requestOptions = {
  method: "DELETE",
  headers: authHeader(),
};
return fetch(
  `${authenticationService.currentBackendAPI}/${req}`,
  requestOptions
).then(handleFileResponse);
} 


function getAllAllocatedListingContributor(schoolUserId) {
  // /api/nirf/contributor-allocation/school-user/{schoolUserId}
  console.log("authenticationService",authenticationService)
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/nba/contributor-allocation/school-user/${schoolUserId}`,
    requestOptions
  ).then(handleResponse);
}

function getnbaAllocatedUsersBynbaSublevel2id(nbaCriteriaSubLevel2Id, year) {
  // [GET] :/api/nba/contributor-allocation/nba-criteria-sub-level2/{nbaCriteriaSubLevel2Id}
  let req = `nba/contributor-allocation/nba-criteria-sub-level2/${nbaCriteriaSubLevel2Id}`;
 
  const requestOptions = { method: "GET", headers: authHeader() };
  return fetch(
    `${authenticationService.currentBackendAPI}/${req}`,
    requestOptions
  ).then(handleResponse);
}