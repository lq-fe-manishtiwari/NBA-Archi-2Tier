// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const PEOService = {
    savePEO,
    saveAllPEO,
    getAllPEO,
    getPEOById,
    getPEOByProgramId,
    deletePEO,
};

// -------------------- SAVE SINGLE PEO --------------------
function savePEO(values) {
    return apiNBARequest(`/obe/peo`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- BULK SAVE PEO --------------------
function saveAllPEO(values) {
    return apiNBARequest(`/obe/peo/saveAll`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- GET ALL PEO --------------------
function getAllPEO() {
    return apiNBARequest(`/obe/peo/all`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- GET PEO BY ID --------------------
function getPEOById(peoId) {
    return apiNBARequest(`/obe/peo/${peoId}`, {
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
function deletePEO(peoId) {
    return apiNBARequest(`/obe/peo/${peoId}`, {
        method: 'DELETE',
        headers: authHeader(),
    }).then(handleResponse);
}