// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const batchService = {
	saveBatch,
	getBatch,
	updateBatch,
	deleteBatch,
	getBatchById,
	getBatchByProgramId
};

function getBatch() {
	// /api/batches
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches`, requestOptions)
		.then(handleResponse);
}

function saveBatch(values) {
	// POST API-/api/batches
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/batches`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function updateBatch(values) {
	// POST   // /: api/batches
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/batches`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function deleteBatch(batchId) {
	// /api/admin/divisions/{id}/soft-delete
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches/${batchId}/soft`, requestOptions)
		.then(handleResponse);
}

function getBatchById(batch_id) {
	// /: /api/batches/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches/batch/${batch_id}`, requestOptions)
		.then(handleResponse);
}
function getBatchByProgramId(program_is) {
	// /: /api/batches/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches/${program_is}`, requestOptions)
		.then(handleResponse);
}