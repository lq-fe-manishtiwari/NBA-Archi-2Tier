// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const POService = {
    getAllPOList,
    getPOData,  //get po1-po11
    savePO,
    getPObyProgramIdYear,   
    getPObyProgramId                 // NEW
};

// -------------------- GET ALL POS --------------------
function getAllPOList() {
    return apiNBARequest(`/obe/po/get-all`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- GET POS defined --------------------
function getPOData() {
    return apiNBARequest(`/obe/po/get-all`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- SAVE PO --------------------
function savePO(values) {
    //POST /api/obe/po/map
    return apiNBARequest(`/obe/po/map`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(response => {
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

// -------------------- GET MAPPED POs --------------------
// GET /api/obe/po/mapped/program/{programId}?academicYearId={optional}
function getPObyProgramIdYear(programid, academicYearId) {
    return apiNBARequest(`/obe/po/mapped/program/${programid}?academicYearId=${academicYearId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function getPObyProgramId(programid) {
    return apiNBARequest(`/obe/po/mapped/program/${programid}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}
