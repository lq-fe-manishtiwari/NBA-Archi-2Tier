// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, AcademicAPI, TeacherLoginAPI ,DevAPI} from '@/_services/api';

export const OtherStaffService = {
        getAllOtherStaff,
        submitOtherStaffRequest,
        deleteOtherStaffHard,
        getOtherStaffDetailsbyID,
        updateOtherStaff,
        softDeleteOtherStaff,
        updateOtherStaffStatus,
    
        getCountries,
        getStatesByCountry,
        getCitiesByState,
}; 

function getAllOtherStaff() {
    // /: /api/admin/other-staff
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/admin/other-staff`, requestOptions)
    .then(handleResponse);
}

function submitOtherStaffRequest(values) {
  // POST   /api/admin/other-staff/bulk
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TeacherLoginAPI}/admin/other-staff/bulk`, requestOptions)
    .then(handleResponse)
    .then(role => {
        return role;
    });
}

function updateOtherStaff(values,id) {
  // POST   /api/admin/other-staff/{id}
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TeacherLoginAPI}/admin/other-staff/${id}`, requestOptions)
    .then(handleResponse)
    .then(role => {
        return role;
    });
}

function deleteOtherStaffHard(id) {
     // /: /api/admin/other-staff/{id}/hard

	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${TeacherLoginAPI}/admin/other-staff/${id}/hard`, requestOptions)
		.then(handleResponse);
}

function getOtherStaffDetailsbyID(id) {
    // /: /api/admin/other-staff/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/admin/other-staff/${id}`, requestOptions)
    .then(handleResponse);
}


function softDeleteOtherStaff(payload) {
    return fetch(`${TeacherLoginAPI}/admin/other-staff/soft-delete`, {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(handleResponse);
  }
  
function updateOtherStaffStatus(otherStaffId, status) {
    // PATCH /api/admin/other-staff/{otherStaffId}/status/{status}
    const requestOptions = {
        method: 'PATCH',
        headers: authHeaderToPost()
    };
    return fetch(`${TeacherLoginAPI}/admin/other-staff/${otherStaffId}/status/${status}`, requestOptions)
        .then(handleResponse);
}

// export const LocationService = {
//   getCountries: async () => {
//     const res = await api.get("/api/countries");
//     return res.data;
//   },

//   getStatesByCountry: async (countryId) => {
//     const res = await api.get(`/api/states/country/${countryId}`);
//     return res.data;
//   },

//   getCitiesByState: async (stateId) => {
//     const res = await api.get(`/api/cities/state/${stateId}`);
//     return res.data;
//   },
// };

function getCountries() {
  // /: /api/admin/countries
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${TeacherLoginAPI}/countries`, requestOptions)
  .then(handleResponse);
}

function getStatesByCountry(countryId) {
  // /: /api/states/country/${countryId}
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${TeacherLoginAPI}/states/country/${countryId}`, requestOptions)
  .then(handleResponse);
}

function getCitiesByState(stateId) {
  // /: /api/cities/state/${stateId}
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${TeacherLoginAPI}/cities/state/${stateId}`, requestOptions)
  .then(handleResponse);
}
