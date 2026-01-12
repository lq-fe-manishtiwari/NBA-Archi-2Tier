// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const COService = {
    saveCO,
    getAllCO,
    getCOBySemCourseId,
    getPEOByProgramId,
    deleteCO,
};

// -------------------- SAVE SINGLE PO --------------------
function saveCO(values) {
    //obe/course-outcome/save
    return apiNBARequest(`/obe/course-outcome/save`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- GET ALL PO --------------------
function getAllCO() {
    return apiNBARequest(`/obe/course-outcome/all`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- GET PEO BY ID --------------------
function getCOBySemCourseId(SemId,SubId) {
    // obe/course-outcome/semester/${SemId}/subject/${subjectId}
    return apiNBARequest(`/obe/course-outcome/semester/${SemId}/subject/${SubId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- GET PEO BY PROGRAM ID --------------------
function getPEOByProgramId(programId) {
    return apiNBARequest(`/obe/peo/program/${programId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- DELETE PEO --------------------
function deleteCO(peoId) {
    return apiNBARequest(`/obe/peo/${peoId}`, {
        method: 'DELETE',
        headers: authHeader(),
    }).then(handleResponse);
}