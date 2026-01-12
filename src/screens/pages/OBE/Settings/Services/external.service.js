// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const ExternalService = {
    saveExternal,
    getExternalByProgramId,
    getExternalBySubjectId,
    getExternalByProgramClassYearID,
    getExternalByProgramSubjectID,
    deleteExternal,
};

// -------------------- SAVE SINGLE External --------------------
function saveExternal(values) {
    // obe/external-config/save
    return apiNBARequest(`/obe/external-config/save`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- GET External BY ID --------------------
function getExternalByProgramId(programId) {
    // obe/external-config/program/
    return apiNBARequest(`/obe/external-config/program/${programId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function getExternalBySubjectId(SubjectId) {
    // obe/external-config/subject/
    return apiNBARequest(`/obe/external-config/subject/${SubjectId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function getExternalByProgramClassYearID(programId,classyearId) {
    // obe/external-config/names/program/${programId}/class-year/${classyearId}
    return apiNBARequest(`/obe/external-config/names/program/${programId}/class-year/${classyearId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function getExternalByProgramSubjectID(programId,SubjectId) {
    // obe/external-config/names/program/${programId}/subject/${SubjectId}
    return apiNBARequest(`/obe/external-config/names/program/${programId}/subject/${SubjectId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- DELETE External --------------------
function deleteExternal(peoId) {
    return apiNBARequest(`/obe/peo/${peoId}`, {
        method: 'DELETE',
        headers: authHeader(),
    }).then(handleResponse);
}