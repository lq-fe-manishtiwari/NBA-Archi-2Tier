// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, TeacherLoginAPI } from '@/_services/api';

export const DepartmentService = {
    saveDepartment,
    getDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
}; 

// POST	/api/departments	Create
// GET	/api/departments/{id}	Get by ID
// GET	/api/colleges/{collegeId}/departments	Get by College
// PUT	/api/departments/{id}	Update
// DELETE	/api/departments/soft/{id}	Soft Delete
// DELETE	/api/departments/hard/{id}	Hard Delete


function getDepartment() {
    // /: /departments
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/departments`, requestOptions)
    .then(handleResponse);
}

function saveDepartment(values) {
  // POST   // /: /departments
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TeacherLoginAPI}/departments`, requestOptions)
    .then(handleResponse)
    .then(role => {
        return role;
    });
}

function updateDepartment(values,id) {
  // POST   /api/departments/{id}
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TeacherLoginAPI}/departments/${id}`, requestOptions)
    .then(handleResponse)
    .then(role => {
        return role;
    });
}

function deleteDepartment(id) {
    // /api/departments/soft/{id}
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/departments/soft/${id}`, requestOptions)
        .then(response => {
        // Safely parse response
        return response.text().then(text => { 
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch (err) {
                console.warn("Failed to parse JSON:", err);
            }

            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }

            return data;
        });
    });
}

function getDepartmentById(id) {
    // /: /api/departments/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/departments/${id}`, requestOptions)
    .then(handleResponse);
}