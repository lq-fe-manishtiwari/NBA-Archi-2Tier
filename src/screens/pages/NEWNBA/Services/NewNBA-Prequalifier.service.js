/** @format */
import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  apiNBARequest,
  AcademicAPI,
} from '@/_services/api';


export const newnbaPrequalifierService = {

  //newnba apis
  saveNBAPrequalifierPartA,
  getNBAPrequalifierPartA,
  putNBAPrequalifierPartA,
  getAllprogram,

  saveNBAPrequalifierPartB,
  getNBAPrequalifierPartB,
  putNBAPrequalifierPartB,
};

function saveNBAPrequalifierPartA(values) {
  const url = `/nba/prequalifier`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function putNBAPrequalifierPartA(id,values) {
  const url = `/nba/prequalifier/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}


function getNBAPrequalifierPartA(cycleId) {
  const url = `/nba/prequalifier/cycle/${cycleId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}


function getAllprogram() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/programs`, requestOptions)
	.then(handleResponse);
}


function saveNBAPrequalifierPartB(values) {
  const url = `/nba/prequalifier/part-b`;
  return apiNBARequest(url, {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}

function putNBAPrequalifierPartB(id,values) {
  const url = `/nba/prequalifier/part-b/${id}`;
  return apiNBARequest(url, {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  }).then(handleResponse);
}


function getNBAPrequalifierPartB(cycleId) {
  const url = `/nba/prequalifier/part-b/by-cycle/${cycleId}`;
  return apiNBARequest(url, {
    method: 'GET',
    headers: authHeader(),
  }).then(handleResponse);
}