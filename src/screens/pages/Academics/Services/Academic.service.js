// Academic Year API Service
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost } from '@/_services/api';

export const AcademicService = {
    saveAcademic,
    getAcademic,
    updateAcademic,
    deleteAcademic,
    getAcademicById,
};

// -------------------- GET ALL ACADEMIC YEARS --------------------
function getAcademic(id) {
    return apiNBARequest(`/nba/academic-years`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- SAVE ACADEMIC YEAR --------------------
function saveAcademic(values) {
    return apiNBARequest(`/nba/academic-years`, {
        method: "POST",
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- UPDATE ACADEMIC YEAR --------------------
function updateAcademic(id, values) {
    return apiNBARequest(`/nba/academic-years/${id}`, {
        method: "PUT",
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- DELETE ACADEMIC YEAR --------------------
function deleteAcademic(id) {
    return apiNBARequest(`/nba/academic-years/${id}`, {
        method: "DELETE",
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- GET ACADEMIC YEAR BY ID --------------------
function getAcademicById(id) {
    return apiNBARequest(`/nba/academic-years/${id}`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}
