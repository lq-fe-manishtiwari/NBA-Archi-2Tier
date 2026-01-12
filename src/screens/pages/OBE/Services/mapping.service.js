// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const MappingService = {
	getPEOMissionMapping,
    savePEOMissionMapping,
    saveCOPOMapping,
    getCOPOMapping,
    getCOPObyProgramSubject,
};

// -------------------- GET ALL MappingS --------------------
function getPEOMissionMapping(programId) {
    //GET /api/obe/peo-mission-mapping/program/
    return apiNBARequest(`/obe/peo-mission-mapping/program/${programId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

// -------------------- SAVE Mapping --------------------
function savePEOMissionMapping(values) {
	//POST /api/obe/peo-mission-mapping/save
    return apiNBARequest(`/obe/peo-mission-mapping/save`, {
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

function saveCOPOMapping(values) {
	//POST /api/obe/co-po-mapping/save
    return apiNBARequest(`/obe/co-po-mapping/save`, {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    }).then(handleResponse);
}

function getCOPOMapping(subId) {
    //GET /api/obe/co-po-mapping/subject/
    return apiNBARequest(`/obe/co-po-mapping/subject/${subId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function getCOPObyProgramSubject(SubID,programId) {
    //GET /api/obe/co-po-mapping/po-averages?subject_id=${SubID}&program_id=${programId}
    return apiNBARequest(`/obe/co-po-mapping/po-averages?subject_id=${SubID}&program_id=${programId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

