// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const BloomService = {
	fetchBloomLevelDefine,
    saveUpdateMission,
    updateMission,
    deleteMission,
    getMissionByProgramId,

    saveMappingBloomsWithSubject,
    getMappedDataOfBlooms,
};

// -------------------- GET ALL MissionS --------------------
function fetchBloomLevelDefine() {
    //GET /api/obe/blooms-level/all
    return apiNBARequest(`/obe/blooms-level/all`, {
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

function saveMappingBloomsWithSubject(subjectId,values) {
	//POST /api/obe/blooms-level/map/subject/{subjectId}
    return apiNBARequest(`/obe/blooms-level/map/subject/${subjectId}`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(response => {
        // Safely parse response
        return response.text().then(text => {
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch (err) {
                console.warn("Failed to parse JSON:", err);
            }

            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }

            return data;
        });
    });
}

function getMappedDataOfBlooms(subjectId) {
    //GET /api/obe/mission/program/{programId}
    return apiNBARequest(`/obe/blooms-level/subject/${subjectId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}