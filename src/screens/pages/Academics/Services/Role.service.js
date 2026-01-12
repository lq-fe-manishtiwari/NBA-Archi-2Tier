// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const RoleService = {
    saveRole,
    getRole,
    updateRole,
    deleteRole,
    getRoleById,
};

// -------------------- GET ALL ROLES --------------------
function getRole(RoleId) {
    return apiNBARequest(`/admin/role?nba=${RoleId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- SAVE ROLE --------------------
function saveRole(values) {
    return apiNBARequest(`/admin/role`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- UPDATE ROLE --------------------
function updateRole(RoleId, values) {
    return apiNBARequest(`/admin/role/${RoleId}`, {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- DELETE ROLE --------------------
function deleteRole(RoleId) {
    return apiNBARequest(`/admin/role/${RoleId}`, {
        method: 'DELETE',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- GET ROLE BY ID --------------------
function getRoleById(RoleId) {
    return apiNBARequest(`/admin/role/${RoleId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}
