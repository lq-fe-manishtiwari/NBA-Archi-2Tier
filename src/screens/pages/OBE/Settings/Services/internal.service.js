// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const InternalService = {
    saveInternal,
    getInternalByProgramId,
    getInternalBySubjectId,
    getInternalByProgramClassYearID,
    getInternalByProgramSubjectID,
    deleteInternal,
};

// -------------------- SAVE SINGLE External --------------------
function saveInternal(values) {
    // obe/external-config/save
    return apiNBARequest(`/obe/internal-config/save`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- GET External BY ID --------------------
function getInternalByProgramId(programId) {
    // obe/external-config/program/
    return apiNBARequest(`/obe/internal-config/program/${programId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function getInternalBySubjectId(SubjectId) {
    // obe/external-config/subject/
    return apiNBARequest(`/obe/internal-config/subject/${SubjectId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function getInternalByProgramClassYearID(programId,classyearId) {
    // obe/external-config/names/program/${programId}/class-year/${classyearId}
    return apiNBARequest(`/obe/internal-config/names/program/${programId}/class-year/${classyearId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function getInternalByProgramSubjectID(programId,SubjectId) {
    // obe/external-config/names/program/${programId}/subject/${SubjectId}
    return apiNBARequest(`/obe/internal-config/names/program/${programId}/subject/${SubjectId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- DELETE External --------------------
function deleteInternal(peoId) {
    return apiNBARequest(`/obe/peo/${peoId}`, {
        method: 'DELETE',
        headers: authHeader(),
    }).then(handleResponse);
}