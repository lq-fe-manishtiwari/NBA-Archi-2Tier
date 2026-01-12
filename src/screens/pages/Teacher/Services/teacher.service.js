// src/screens/pages/Teacher/Services/teacher.service.js

import { authHeader, AcademicAPI, TeacherLoginAPI } from '@/_services/api';
import { gql } from '@apollo/client';
import client from '@/_graphql/apolloClient';


// Teacher API endpoints - Using new environment configuration
const TEACHER_API_BASE = `${TeacherLoginAPI}/admin/teacher`;

// Academic API endpoints
const ACADEMIC_API_BASE = `${AcademicAPI}`;

// GraphQL endpoint - Using TeacherLoginAPI for GraphQL
const GRAPHQL_API = `${TeacherLoginAPI}/graphql`;

// Helper for error handling
const handleResponse = async (res) => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorText}`);
  }
  return res.json();
};

// ==================== REST API FUNCTIONS ====================

// 📘 1. Bulk Onboard Teachers
export const bulkOnboardTeachers = async (teachersData, options = {}) => {
  const { userNameType = 'FIRSTNAME', suffix = null, prefix = null } = options;
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('userNameType', userNameType);
  if (suffix) queryParams.append('suffix', suffix);
  if (prefix) queryParams.append('prefix', prefix);

  const url = `${TEACHER_API_BASE}/bulk`;
  

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(teachersData),
  });
  
  return handleResponse(res);
};

// 🧾 2. Create Single Teacher
export const createTeacher = async (teacherData) => {
  const res = await fetch(TEACHER_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(teacherData),
  });
  return handleResponse(res);
};

// Keep the old function name for backward compatibility
export const saveTeacher = createTeacher;

// ✏️ 3. Update Teacher
export const updateTeacher = async (teacherId, updatedData) => {
  const res = await fetch(`${TEACHER_API_BASE}/${teacherId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(updatedData),
  });
  return handleResponse(res);
};

// 🗑️ 4. Soft Delete Teacher (Password Protected)
export const softDeleteTeacher = async (payload) => {
  const res = await fetch(`${TEACHER_API_BASE}/soft-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// 💀 5. Hard Delete Teacher
export const hardDeleteTeacher = async (teacherId) => {
  const res = await fetch(`${TEACHER_API_BASE}/${teacherId}/hard`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// 🔄 6. Update Active Status
export const updateTeacherStatus = async (teacherId, status) => {
  const res = await fetch(`${TEACHER_API_BASE}/${teacherId}/status/${status}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// ==================== GRAPHQL QUERIES ====================

// 📋 7. Get All Teachers (Paginated) - GraphQL
export const GET_ALL_TEACHERS = gql`
  query GetTeachers($page: Int!, $size: Int!) {
    allTeachers(page: $page, size: $size) {
      content {
        teacherId
        firstname
        lastname
        email
        mobile
        designation
        username
        active
        userType
      }
      totalElements
      totalPages
      pageNumber
      pageSize
    }
  }
`;

export const fetchAllTeachers = async (page = 0, size = 10) => {
  try {
    const { data } = await client.query({
      query: GET_ALL_TEACHERS,
      variables: { page, size },
      fetchPolicy: 'network-only'
    });
    return data.allTeachers;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

// 👤 8. Get Single Teacher - GraphQL
// GraphQL Query
export const GET_TEACHER_BY_ID = gql`
  query GetTeacher($id: ID!) {
    teacher(id: $id) {
      teacherId
      employeeId
      firstname
      middlename
      lastname
      avatar
      email
      phone
      mobile
      gender
      height
      weight
      bloodGroup
      dateOfBirth
      dateOfJoining
      primarySubject
      secondarySubject1
      secondarySubject2
      maritalStatus
      spouseName
      fatherName
      addressLine1
      addressLine2
      country
      state
      city
      pincode
      aadharNumber
      panNumber
      designation
      uanNumber
      bankName
      bankAccountNo
      ifscCode
      costToCompany
      deduction
      netPay
      reportsAccess
      financialYear
      connectLink
      probationCompleted
      probationCompletedDate
      probationApprovedBy
      probationComment
      userId
      username
      active
      userType
      
      # ✅ Correctly match your schema here:
      customFields {
        custom_field_id
        field_value
      }

      # (Optional) Include these if you also want nested data:
      teacherAccessAttributes {
        key
        value
      }

      teacherQualifications {
        degree
        passing_year
        school_university
        passing_percentage
      }

      teacherEmployments {
        organization
        from_date
        to_date
        organization_hr_name
        organization_hr_email
        organization_hr_contact_number
      }
    }
  }
`;


export const fetchTeacherById = async (teacherId) => {
  try {
    const { data } = await client.query({
      query: GET_TEACHER_BY_ID,
      variables: { id: teacherId.toString() },
      fetchPolicy: 'network-only'
    });
    return data.teacher;
  } catch (error) {
    console.error('Error fetching teacher:', error);
    throw error;
  }
};

// 🔍 9. Combined Query (All + One) - GraphQL
export const GET_TEACHERS_COMBINED = gql`
  query GetTeachersCombined($page: Int!, $size: Int!, $teacherId: ID!) {
    allTeachers(page: $page, size: $size) {
      content {
        teacherId
        firstname
        email
      }
      totalElements
    }
    teacher(id: $teacherId) {
      firstname
      mobile
      username
      userType
    }
  }
`;

export const fetchTeachersCombined = async (page = 0, size = 10, teacherId) => {
  try {
    const { data } = await client.query({
      query: GET_TEACHERS_COMBINED,
      variables: { page, size, teacherId: teacherId.toString() },
      fetchPolicy: 'network-only'
    });
    return data;
  } catch (error) {
    console.error('Error fetching combined teachers data:', error);
    throw error;
  }
};

// 📊 10. Get Paginated Teachers with Variables - GraphQL  
export const fetchPaginatedTeachers = async (page = 0, size = 10) => {
  const GET_PAGINATED_TEACHERS = gql`
    query GetPaginatedTeachers($page: Int!, $size: Int!) {
      allTeachers(page: $page, size: $size) {
        content {
          teacherId
          firstname
          userType
        }
        totalElements
      }
    }
  `;

  try {
    const { data } = await client.query({
      query: GET_PAGINATED_TEACHERS,
      variables: { page, size },
      fetchPolicy: 'network-only'
    });
    return data.allTeachers;
  } catch (error) {
    console.error('Error fetching paginated teachers:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

// 🔍 Search Teachers (REST fallback)
export const searchTeachers = async (searchQuery) => {
  const res = await fetch(`${TEACHER_API_BASE}/search?q=${encodeURIComponent(searchQuery)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// 📊 Get Teacher Statistics
export const getTeacherStats = async () => {
  const res = await fetch(`${TEACHER_API_BASE}/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// 🔄 Toggle Multiple Teachers Status
export const toggleMultipleTeachersStatus = async (teacherIds, status) => {
  const promises = teacherIds.map(id => updateTeacherStatus(id, status));
  return Promise.all(promises);
};

// 📋 Export Teachers Data
export const exportTeachersData = async (format = 'xlsx') => {
  const res = await fetch(`${TEACHER_API_BASE}/export?format=${format}`, {
    method: 'GET',
    headers: {
      ...authHeader(),
    },
  });
  
  if (!res.ok) {
    throw new Error(`Export failed: ${res.status}`);
  }
  
  return res.blob();
};

// ==================== LEGACY SUPPORT ====================
// Keep existing functions for backward compatibility

export const fetchStudents = fetchAllTeachers; // Alias for backward compatibility
export const fetchStudentById = fetchTeacherById; // Alias for backward compatibility
export const updateStudent = updateTeacher; // Alias for backward compatibility
export const deleteStudent = hardDeleteTeacher; // Alias for backward compatibility

// Location APIs (keep existing)
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

// Legacy bulk onboard function for students (keep for compatibility)
export const bulkOnboardStudents = async (studentsData) => {
  console.log('Payload being sent:', studentsData);
  
  const userNameType = studentsData[0]?.userNameType || "ROLLNUMBER";
  const cleanPayload = studentsData.map(({ userNameType, ...rest }) => rest);
  const url = `${TeacherLoginAPI}/admin/students/bulk-onboard?userNameType=${encodeURIComponent(userNameType)}`;

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

// {
//   "teacher_id": 20,
//   "program_id": 5,
//   "class_year_id": 2,
//   "division_id": 3,
//   "subject_ids": [1, 2, 3]
// } 
// POST-/api/admin/teacher-allocation/create
export const allocateTeacher = async (teacherData) => {
  const res = await fetch(`${TeacherLoginAPI}/admin/teacher-allocation/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(teacherData),
  });
  return handleResponse(res);
};

// GET Teacher Allocation by Allocation ID
export const getTeacherAllocationById = async (allocationId) => {
  const res = await fetch(`${TeacherLoginAPI}/admin/teacher-allocation/${allocationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// GET Teacher Allocations by Teacher ID
export const getTeacherAllocationsByTeacherId = async (teacherId) => {
  const res = await fetch(`${TeacherLoginAPI}/admin/teacher-allocation/teacher/${teacherId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// PUT Update Teacher Allocation
export const updateTeacherAllocation = async (allocationId, allocationData) => {
  const res = await fetch(`${TeacherLoginAPI}/admin/teacher-allocation/edit/${allocationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(allocationData),
  });
  return handleResponse(res);
};

// DELETE Teacher Allocation (Soft Delete)
export const softDeleteTeacherAllocation = async (allocationId) => {
  const res = await fetch(`${TeacherLoginAPI}/admin/teacher-allocation/soft/${allocationId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};

// DELETE Teacher Allocation (Hard Delete)
export const hardDeleteTeacherAllocation = async (allocationId) => {
  const res = await fetch(`${TeacherLoginAPI}/admin/teacher-allocation/hard/${allocationId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
};