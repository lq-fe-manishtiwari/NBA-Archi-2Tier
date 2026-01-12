// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const collegeService = {
	getAllColleges,
	submitCollegeRequest,
	deleteCollege,
	getCollegeDetails,
	updateCollege,
	getAllCollegesByUser,


	
	// // get batch using board id
	// getBatches,
	// getBatchesByGradeId


	//Programs
	getAllprogram,
	getAllProgramByCollegeId,
	getAllProgramByUserCollegeId,
	saveProgram,
	updateProgrambyID,
	DeleteprogrambyID,
	getProgrambyId,

	getSUbjectbyProgramID,
};

// GET : /api/new-colleges
function getAllColleges() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/new-colleges`, requestOptions)
		.then(handleResponse);
}

function getAllCollegesByUser(userId) {
	// /core/api/admin/academic/colleges?userId=12
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/colleges?userId=${userId}`, requestOptions)
		.then(handleResponse);
}

// POST : /api/new-colleges
function submitCollegeRequest(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/new-colleges`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

// ✅ Fetch single college details
// GET : /api/new-college/${collegeId}
function getCollegeDetails(collegeId) {
	const requestOptions = { method: "GET", headers: authHeader() };
	return fetch(`${AcademicAPI}/new-college/${collegeId}`, requestOptions).then(handleResponse);
}

// ✅ Update college details
// PUT : /api/new-college/${collegeId}
function updateCollege(collegeId, values) {
	const requestOptions = {
		method: "PUT",
		headers: authHeaderToPost(),
		body: JSON.stringify(values),
	};
	return fetch(`${AcademicAPI}/new-college/${collegeId}`, requestOptions).then(handleResponse);
}

// GET : /api/new-college/${collegeId}
function deleteCollege(collegeId) {
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/new-college/${collegeId}`, requestOptions)
		.then(handleResponse);
}




// Program 

function getAllprogram() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/programs`, requestOptions)
	.then(handleResponse);
}

// /api/admin/programs/by-college/{collegeId}
function getAllProgramByCollegeId(collegeId) {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/programs/by-college/${collegeId}`, requestOptions)
	.then(handleResponse);
}

function getAllProgramByUserCollegeId(userId,collegeId) {
	// /api/admin/academic/programs/allocated/user/{userId}/college/{collegeId
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/programs/allocated/user/${userId}/college/${collegeId}`, requestOptions)
	.then(handleResponse);
}

function saveProgram(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/programs/bulk`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

function DeleteprogrambyID(val) {
	// /api/admin/programs/{id}/soft-delete
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/programs/`+val+`/soft-delete`, requestOptions)
	.then(handleResponse);
}

function getProgrambyId(Program_id) {
	// api/admin/programs/program/{programId}

	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/programs/program/${Program_id}`, requestOptions)
	.then(handleResponse);
}
function updateProgrambyID(values) {
	// PUT : /admin/programs
const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/programs`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

function getSUbjectbyProgramID(Program_id) {
	// subjects/program/{programId}

	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subjects/program/${Program_id}`, requestOptions)
	.then(handleResponse);
}
