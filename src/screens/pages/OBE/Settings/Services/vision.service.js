// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const VisionService = {
	getAllVision,
    saveVision,
    SaveUpdateVision,
    deleteVision,
    getVisionByProgramId,
};

// -------------------- GET ALL visionS --------------------
function getAllVision() {
    return apiNBARequest(`/obe/vision/all`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- SAVE vision --------------------
function saveVision(values) {
	//POST /api/obe/vision/save
    return apiNBARequest(`/obe/vision/save`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- UPDATE vision --------------------
function SaveUpdateVision(programId, values) {
    //POST /api/obe/vision/save/bulk/{programId}
    return apiNBARequest(`/obe/vision/save/bulk/${programId}`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- DELETE vision --------------------
function deleteVision(VissionId) {
    return apiNBARequest(`/nba/categories/${VissionId}`, {
        method: 'DELETE',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- GET vision BY ID --------------------
function getVisionByProgramId(VissionId) {
    return apiNBARequest(`/obe/vision/program/${VissionId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}
