import { authHeader, handleResponse, authHeaderToPost,AcademicAPI,TeacherLoginAPI } from '@/_services/api';
// import { AcademicAPI } from '../../../../_services/api';

export const AdminGradeAllocationService = {
    getAllProgramUserAllocation,
    getProgramUserUsingUserID,
    saveProgramUserAllocation,
    deleteProgramUserAllocationByUserID,
    updateProgramUserAllocationID,
    getAllSchoolUser
};

function saveProgramUserAllocation(values) {
    // get /api/admin/program-allocations
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${AcademicAPI}/program-allocations`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getAllProgramUserAllocation() {
    // get /api/admin/program-allocations
    const requestOptions = { method: 'GET', headers: authHeader() };

    return fetch(`${AcademicAPI}/program-allocations`,requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getProgramUserUsingUserID(userId) {
    // get /api/admin/program-allocations/user/{userId}
    const requestOptions = { method: 'GET', headers: authHeader() };

    return fetch(`${AcademicAPI}/program-allocations/user/${userId}`,requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function deleteProgramUserAllocationByUserID(userId) {
    // DELETE /api/admin/program-allocations/user/{userId}
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${AcademicAPI}/program-allocations/user/${userId}`, requestOptions)
        .then(handleResponse);
}
function updateProgramUserAllocationID(allocationId,values) {
    // get /api/admin/program-allocations/{allocationId}
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${AcademicAPI}/program-allocations/${allocationId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getAllSchoolUser() {
    // get /api/admin/program-allocations
   const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/admin/other-staff`, requestOptions)
    .then(handleResponse);
}
