// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const PSOService = {
	getAllPSO,
    saveupdatePSO,
    updatePSO,
    deletePSO,
    getPSOByProgramId,
};

// -------------------- GET ALL PSOS --------------------
function getAllPSO() {
    //GET /api/obe/pso/getAll
    return apiNBARequest(`/obe/pso/getAll`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- SAVE PSO --------------------
function saveupdatePSO(values) {
	// POST /api/obe/pso/save
    return apiNBARequest(`/obe/pso/save`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- UPDATE PSO --------------------
function updatePSO(PsoID, values) {
    //POST /api/obe/pso/save
    return apiNBARequest(`/obe/pso/save/${PsoID}`, {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- DELETE PSO --------------------
function deletePSO(PsoID) {
    //DELETE /api/obe/pso/{id}
    return apiNBARequest(`/obe/pso/${PsoID}`, {
        method: 'DELETE',
        headers: authHeader(),
    }).then(response => {
    if (response.status === 200) return true; // treat as success
    return handleResponse(response);
});
}

// -------------------- GET PSO BY ID --------------------
function getPSOByProgramId(ProgramID) {
    //GET /api/obe/pso/program/{programId}
    return apiNBARequest(`/obe/pso/program/${ProgramID}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}
