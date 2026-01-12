// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const classService = {
	getAllClasses,
    saveClass,
    saveBulkClass,
	getClassById,
	updateClass,
	deleteClassbyID,
}; 

// GET /api/admin/class-years
function getAllClasses() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/class-years`, requestOptions)
	.then(handleResponse);
}

// POST /api/admin/class-years
function saveClass(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/class-years`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

// POST /api/admin/class-years/bulk
function saveBulkClass(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/class-years/bulk`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

function getClassById(classId) {
	// GET /api/admin/class-years/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/class-years/${classId}`, requestOptions)
	.then(handleResponse);
}

function updateClass(classId, values) {
	// POST   // /: /api/admin/class-years/{id}
	  const requestOptions = {
		  method: 'PUT',
		  headers: authHeaderToPost(),
		  body: JSON.stringify(values)
	  };
	  return fetch(`${AcademicAPI}/class-years`, requestOptions)
	  .then(handleResponse)
	  .then(role => {
		  return role;
	  });
  }

function deleteClassbyID(classId) {
	// DELETE /api/admin/class-years/{id}/soft-delete
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/class-years/${classId}/soft-delete`, requestOptions)
	.then(handleResponse);
}