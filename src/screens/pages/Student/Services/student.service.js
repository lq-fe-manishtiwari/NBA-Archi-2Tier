// src/Services/student.service.js

import { authHeader, AcademicAPI, TeacherLoginAPI } from '@/_services/api';

// Student API endpoints (REST-style) - Using TeacherLoginAPI for student management
const STUDENT_API_BASE = `${TeacherLoginAPI}/admin/students`;

// Helper for error handling
const handleResponse = async (res) => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorText}`);
  }
  return res.json();
};

// === EXPORTED FUNCTIONS ===

// 📘 Fetch all students
export const fetchStudents = async () => {
  const res = await fetch(`${STUDENT_API_BASE}/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

export const fetchStudentById = async (student_id) => {
  const res = await fetch(`${STUDENT_API_BASE}/${student_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// 🧾 Save (create) a student
export const saveStudent = async (student) => {
  const res = await fetch(`${STUDENT_API_BASE}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(student),
  });
  return handleResponse(res);
};

// ✏️ Update existing student
export const updateStudent = async (updatedStudent) => {
  // api/admin/students/personal
  const res = await fetch(`${STUDENT_API_BASE}/personal`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(updatedStudent),
  });
  return handleResponse(res);
};

// 🗑️ Soft Delete Student (Password Protected)
export const softDeleteStudent = async (payload) => {
  const res = await fetch(`${STUDENT_API_BASE}/soft-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// ❌ Delete a student (optional helper)
export const deleteStudent = async (id) => {
  const res = await fetch(`${STUDENT_API_BASE}/${id}/hard`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  
  // Handle delete response - API returns 204 No Content with empty body
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorText}`);
  }
  
  // For 204 No Content, return success indication instead of parsing JSON
  if (res.status === 204) {
    return { success: true, status: 204 };
  }
  
  // For other successful responses, try to parse JSON
  return res.json();
};

//countries
export const fetchCountries = async () => {
  const res = await fetch(`${AcademicAPI}/countries`, {  
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

export const fetchStates = async (countryId) => {
  const res = await fetch(`${AcademicAPI}/states/country/${countryId}`, {  
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

export const fetchCities = async (stateId) => {
  const res = await fetch(`${AcademicAPI}/cities/state/${stateId}`, {  
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// Bulk Onboard Students (FIXED: userNameType as query param)
export const bulkOnboardStudents = async (studentsData, options = {}) => {
  console.log('Payload being sent:', studentsData);
  console.log('Options:', options);

  const userNameType = options.userNameType || "ROLLNUMBER";
  const prefix = options.prefix || "";
  const suffix = options.suffix || "";

  // Remove userNameType from payload — NOT allowed in body
  const cleanPayload = studentsData.map(({ userNameType, ...rest }) => rest);

  // Build URL with required query parameters
  let url = `${STUDENT_API_BASE}/bulk-onboard?userNameType=${encodeURIComponent(userNameType)}`;
  if (prefix) {
    url += `&prefix=${encodeURIComponent(prefix)}`;
  }

  if (suffix) {
    url += `&suffix=${encodeURIComponent(suffix)}`;
  }
  console.log('Final URL:', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(cleanPayload),
  });

  return handleResponse(res);
};

// student -academics
export const fetchClassesByprogram = async (programId) => {
  // admin/program-class-year/program
  const res = await fetch(`${AcademicAPI}/program-class-year/program/${programId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

export const allocateStudents = async (student) => {
  // /api/admin/students/allocate
  const res = await fetch(`${STUDENT_API_BASE}/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(student),
  });
  return handleResponse(res);
};

export const changeStatus = async (studentId, status) => {
// /api/admin/students/allocate
  const res = await fetch(`${STUDENT_API_BASE}/${studentId}/reactivate/${status}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

export const StudentDeallocation = async (allocationId) => {
  // /api/admin/students/allocate
  const res = await fetch(`${STUDENT_API_BASE}/deallocate/${allocationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

export const PromoteStudents = async (student) => {
  // /api/admin/students/allocate
  const res = await fetch(`${STUDENT_API_BASE}/promote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(student),
  });
  return handleResponse(res);
};

// 📚 Fetch student academic history
export const fetchStudentHistory = async (studentId) => {
  const res = await fetch(`${STUDENT_API_BASE}/student/${studentId}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};