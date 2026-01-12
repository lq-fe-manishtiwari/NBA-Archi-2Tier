// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const courseService = {
	getAllCourses,
	getCourseById,
    saveCourse,
	saveBulkCourses,
	deleteCourse,
	updateCourse,
	getSubjectByProgramID,

    getCoursesPaperTypes,
	getPaperTypeById,
	savePaperType,
	updatePaperType,
	softDeletePaperType,
    getCoursesVerticalNumbers,
	// getVerticalNumberById,
	saveVerticalNumber,
	updateVerticalNumber,
	softDeleteVerticalNumber,
	getCoursesSubjectMode,
	getSubjectModeById,
	saveSubjectMode,
	updateSubjectMode,
	softDeleteSubjectMode,
	getCoursesSpecialization,
	getSpecializationById,
	saveSpecialization,
	updateSpecialization,
	softDeleteSpecialization,

	 //bulk upload
	bulkUploadPapers, 
	bulkUploadModule,  
	bulkUploadUnit,

	saveModule,
	getAllModules,
	getModuleById,
	updateModule,
	softDeleteModule,
}; 

// GET /api/admin/subjects 
function getAllCourses() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subjects`, requestOptions)
	.then(handleResponse);
}

function getCourseById(paperId) {
	// GET /api/admin/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/${paperId}`, requestOptions)
	.then(handleResponse);
}

// POST /api/admin/subjects/create
function saveCourse(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subjects/create`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

// POST /api/admin/subjects/bulk-upload 
function saveBulkCourses(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subjects/bulk-upload`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

function deleteCourse(subjectId) {
	//  /api/admin/subjects/soft/{subjectId} 
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/subjects/soft/${subjectId}`, requestOptions)
		.then(handleResponse);
}

function updateCourse(subjectId,values) {
 //   PUT /api/admin/subjects/edit/{id} 
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${AcademicAPI}/subjects/edit/${subjectId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getSubjectByProgramID(programId) {
	// GET- /api/admin/academic/subjects/program/{programId} 
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subjects/program/${programId}`, requestOptions)
	.then(handleResponse);
}

// SUBJECT TYPE

// GET- /api/admin/subject-type 
function getCoursesPaperTypes() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subject-type`, requestOptions)
	.then(handleResponse);
}

function getPaperTypeById(paperTypeId) {
	// GET /api/admin/subject-type/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subject-type/${paperTypeId}`, requestOptions)
	.then(handleResponse);
}

// POST /api/admin/subject-type/create
function savePaperType(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subject-type/create`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

function updatePaperType(paperTypeId, values) {
	// PUT- /api/admin/academic/subject-type/{id} 
	  const requestOptions = {
		  method: 'PUT',
		  headers: authHeaderToPost(),
		  body: JSON.stringify(values)
	  };
	  return fetch(`${AcademicAPI}/subject-type/${paperTypeId}`, requestOptions)
	  .then(handleResponse)
	  .then(role => {
		  return role;
	  });
  }


// DELETE - /api/admin/subject-type/soft/{id}
function softDeletePaperType(id) {
	return fetch(`${AcademicAPI}/subject-type/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	})
}

//   VERTICAL NUMBER

//GET- /api/admin/vertical-type 
function getCoursesVerticalNumbers() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/vertical-type`, requestOptions)
	.then(handleResponse);
}

function getVerticalNumberById(verticalNumberId) {
	// GET BY vertical type /api/admin/academic/vertical-type/{id} 
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/vertical-type/${verticalNumberId}`, requestOptions)
	.then(handleResponse);
}

// POST /api/admin/vertical-type/create
function saveVerticalNumber(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/vertical-type/create`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

function updateVerticalNumber(verticalNumberId, values) {
	// PUT- /api/admin/academic/vertical-type/{id} 
	  const requestOptions = {
		  method: 'PUT',
		  headers: authHeaderToPost(),
		  body: JSON.stringify(values)
	  };
	  return fetch(`${AcademicAPI}/vertical-type/${verticalNumberId}`, requestOptions)
	  .then(handleResponse)
	  .then(role => {
		  return role;
	  });
  }


// /api/admin/vertical-type/soft/{id} 
function softDeleteVerticalNumber(id) {
	return fetch(`${AcademicAPI}/vertical-type/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	})
}




//   SUBJECT MODE

//GET /api/admin/subject-mode 
function getCoursesSubjectMode() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subject-mode`, requestOptions)
	.then(handleResponse);
}

function getSubjectModeById(subjectModeId) {
	// GET By subject Mode id /api/admin/academic/subject-mode/{id} 
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subject-mode/${subjectModeId}`, requestOptions)
	.then(handleResponse);
}

// POST /api/admin/subject-mode/create
function saveSubjectMode(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subject-mode/create`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

function updateSubjectMode(subjectModeId, values) {
	// PUT- /api/admin/academic/subject-mode/{id}
	  const requestOptions = {
		  method: 'PUT',
		  headers: authHeaderToPost(),
		  body: JSON.stringify(values)
	  };
	  return fetch(`${AcademicAPI}/subject-mode/${subjectModeId}`, requestOptions)
	  .then(handleResponse)
	  .then(role => {
		  return role;
	  });
  }

// DELETE - /api/admin/subject-mode/soft/{id}
function softDeleteSubjectMode(id) {
	return fetch(`${AcademicAPI}/subject-mode/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	});
}





// SPECIALIZATION

// GET ALL /api/admin/academic/specialization  
function getCoursesSpecialization() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/specialization`, requestOptions)
	.then(handleResponse);
}

function getSpecializationById(specializationId) {
	// GET By subject Mode id /api/admin/academic/specialization/{id} 
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/specialization/${specializationId}`, requestOptions)
	.then(handleResponse);
}

// POST /api/admin/academic/specialization
function saveSpecialization(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/specialization`, requestOptions)
	.then(handleResponse)
	.then(role => {
		return role;
	});
}

function updateSpecialization(specializationId, values) {
	// PUT- /api/admin/academic/specialization/{id}
	  const requestOptions = {
		  method: 'PUT',
		  headers: authHeaderToPost(),
		  body: JSON.stringify(values)
	  };
	  return fetch(`${AcademicAPI}/specialization/${specializationId}`, requestOptions)
	  .then(handleResponse)
	  .then(role => {
		  return role;
	  });
  }

// DELETE-/api/admin/academic/specialization/soft/{id} 
function softDeleteSpecialization(id) {
	return fetch(`${AcademicAPI}/specialization/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	});
  }

  // BULK UPLOAD
  function bulkUploadPapers(values) {
  // POST  /api/admin/subjects/bulk-upload
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  };
  return fetch(`${AcademicAPI}/subjects/bulk-upload`, requestOptions)
    .then(handleResponse)
    .then((res) => {
      return res;
    });
}

//-------------MODULE-------------

// POST api/admin/module-unit/module 
function saveModule(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/module-unit/module`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

// GET- /api/admin/module-unit/modules 
function getAllModules() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/module-unit/modules`, requestOptions)
	.then(handleResponse);
}

  // BULK UPLOAD
  function bulkUploadModule(values) {
  // POST  /api/admin/module-unit/module/bulk
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  };
  return fetch(`${AcademicAPI}/module-unit/module/bulk`, requestOptions)
    .then(handleResponse)
    .then((res) => {
      return res;
    });
}

//-------------UNIT-------------

  // BULK UPLOAD
  function bulkUploadUnit(values) {
	// POST /api/admin/module-unit/unit/bulk 
	const requestOptions = {
	  method: "POST",
	  headers: authHeaderToPost(),
	  body: JSON.stringify(values),
	};
	return fetch(`${AcademicAPI}/module-unit/unit/bulk`, requestOptions)
	  .then(handleResponse)
	  .then((res) => {
		return res;
	  });
	}
//GET- /api/admin/module-unit/module/{id} 
function getModuleById(id) {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/module-unit/module/${id}`,requestOptions)
	.then(handleResponse);
}

//PUT- /api/admin /module-unit/module/{id} 
function updateModule(id, values) {
		  const requestOptions = {
		  method: 'PUT',
		  headers: authHeaderToPost(),
		  body: JSON.stringify(values)
	  };
	  return fetch(`${AcademicAPI}/module-unit/module/${id}`, requestOptions)
	  .then(handleResponse)
	  .then(role => {
		  return role;
	  });
  }

  //DELETE- /api/admin/module-unit/module/soft/{id} 
  function softDeleteModule(id) {
	return fetch(`${AcademicAPI}/module-unit/module/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	});
}