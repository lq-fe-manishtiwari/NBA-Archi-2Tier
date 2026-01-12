// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost ,AcademicAPI} from '@/_services/api';
// import { AcademicAPI } from '../../../../_services/api';

export const DivisionService = {
    saveDivision,
    getDivision,
    updateDivision,
    deleteDivision,
    getDivisionById,
}; 

function getDivision() {
    // /: /api/admin/divisions
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${AcademicAPI}/divisions`, requestOptions)
    .then(handleResponse);
}

function saveDivision(values) {
  // POST   // /: /api/admin/divisions/bulk
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${AcademicAPI}/divisions/bulk`, requestOptions)
    .then(handleResponse)
    .then(role => {
        return role;
    });
}

function updateDivision(values) {
  // POST   // /: /api/admin/divisions/bulk
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${AcademicAPI}/divisions`, requestOptions)
    .then(handleResponse)
    .then(role => {
        return role;
    });
}

function deleteDivision(divisionId) {
    // /api/admin/divisions/{id}/soft-delete
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/divisions/${divisionId}/soft-delete`, requestOptions)
		.then(handleResponse);
}

function getDivisionById(division_id) {
    // /: /api/admin/divisions/division/{division_id
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${AcademicAPI}/divisions/division/${division_id}`, requestOptions)
    .then(handleResponse);
}