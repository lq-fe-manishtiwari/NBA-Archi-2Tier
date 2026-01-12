
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost } from "@/_services/api";

export const SubCategoryService= {
    getAllCollegeTypes,
    getCollegeTypesByCollegeId,
    saveCollegeType,
    updateCollegeType,
    deleteCollegeType,
    getCollegeTypeById,
};

/* ------------------------------------------------------------
   GET ALL COLLEGE TYPES
   GET /api/nba/college-type
-------------------------------------------------------------*/
function getAllCollegeTypes() {
    return apiNBARequest(`/nba/college-type`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

/* ------------------------------------------------------------
   GET COLLEGE TYPES BY COLLEGE ID
   GET /api/nba/college-type/{collegeId}
-------------------------------------------------------------*/
function getCollegeTypesByCollegeId(collegeId) {
    return apiNBARequest(`/nba/college-type/${collegeId}`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

/* ------------------------------------------------------------
   SAVE COLLEGE TYPE
   POST /api/nba/college-type
   Body:
   {
     "college_id": 1,
     "type_name": "UG"
   }
-------------------------------------------------------------*/
function saveCollegeType(values) {
    return apiNBARequest(`/nba/college-type`, {
        method: "POST",
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

/* ------------------------------------------------------------
   UPDATE COLLEGE TYPE
   PUT /api/nba/college-type/{id}
-------------------------------------------------------------*/
function updateCollegeType(id, values) {
    return apiNBARequest(`/nba/college-type/${id}`, {
        method: "PUT",
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

/* ------------------------------------------------------------
   DELETE COLLEGE TYPE
   DELETE /api/nba/college-type/{id}
-------------------------------------------------------------*/
function deleteCollegeType(id) {
    return apiNBARequest(`/nba/college-type/${id}`, {
        method: "DELETE",
        headers: authHeader(),
    }).then(handleResponse);
}

/* ------------------------------------------------------------
   GET COLLEGE TYPE BY ID
   GET /api/nba/college-type/{id}
-------------------------------------------------------------*/
function getCollegeTypeById(id) {
    return apiNBARequest(`/nba/college-type/${id}`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}
