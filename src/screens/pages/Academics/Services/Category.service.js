// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost } from '@/_services/api';

export const CategoryService = {
    getCategory,
    saveCategory,
    getCategoryById,
    updateCategory,   // NOT AVAILABLE
    deleteCategory,   // ✔ WORKING
};

// -------------------- GET ALL CATEGORIES --------------------
function getCategory() {
    return apiNBARequest(`/nba/college-category`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- ADD CATEGORY --------------------
// values must be: { college_id: 1, category_name: "Engineering" }
function saveCategory(values) {
    return apiNBARequest(`/nba/college-category`, {
        method: "POST",
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

// -------------------- GET CATEGORY BY ID --------------------
function getCategoryById(categoryId) {
    return apiNBARequest(`/nba/college-category/${categoryId}`, {
        method: "GET",
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- UPDATE CATEGORY (NOT AVAILABLE YET) --------------------
function updateCategory() {
    return Promise.reject("Update API not available for college-category");
}

// -------------------- DELETE CATEGORY (AVAILABLE) --------------------
function deleteCategory(categoryId) {
    return apiNBARequest(`/nba/college-category/${categoryId}`, {
        method: "DELETE",
        headers: authHeader(),
    }).then(handleResponse);
}
