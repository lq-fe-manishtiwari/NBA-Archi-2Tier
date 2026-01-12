// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const MissionService = {
	getAllMission,
    saveUpdateMission,
    updateMission,
    deleteMission,
    getMissionByProgramId,
};

// -------------------- GET ALL MissionS --------------------
function getAllMission() {
    //GET /api/obe/mission/all
    return apiNBARequest(`/obe/mission/all`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- SAVE Mission --------------------
function saveUpdateMission(values) {
	//POST /api/obe/mission/save-all
    return apiNBARequest(`/obe/mission/save-all`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- UPDATE Mission --------------------
function updateMission(MissionId, values) {
    /// /api/obe/mission/save-all
    return apiNBARequest(`/obe/mission/save-all/${MissionId}`, {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- DELETE Mission --------------------
function deleteMission(MissionId) {
    //DELETE /api/obe/mission/delete/{id}
    return apiNBARequest(`/obe/mission/delete/${MissionId}`, {
        method: 'DELETE',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- GET Mission BY ID --------------------
function getMissionByProgramId(MissionId) {
    //GET /api/obe/mission/program/{programId}
    return apiNBARequest(`/obe/mission/program/${MissionId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}
