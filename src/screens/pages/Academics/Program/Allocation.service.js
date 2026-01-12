import { authHeader, handleResponse, authHeaderToPost } from '@/_services/api';
import { DevAPI } from '../../../../_services/api';

export const allocationService = {
    saveAllocation,
    getProgramAllocatedDetailsbyProgramId,
    deleteProgramDivisionAllocationByPCYSD
};

function saveAllocation(values) {
    // POST /api/admin/program-class-year/allocate
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${DevAPI}/admin/program-class-year/allocate-bulk`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getProgramAllocatedDetailsbyProgramId(programId) {
    // get /api/admin/program-class-year/program/{programId}
	const requestOptions = { method: 'GET', headers: authHeader() };

    return fetch(`${DevAPI}/admin/program-class-year/structure/${programId}`,requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}


function deleteProgramDivisionAllocationByPCYSD(id) {
    // /allocation/{pcysdId}
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${DevAPI}/admin/program-class-year/allocation/${id}`, requestOptions)
        .then(handleResponse);
}