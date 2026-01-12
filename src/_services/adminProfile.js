// src/_services/adminProfile.js

import {
	authHeader,
	handleResponse,
	authHeaderToPost,
	TeacherLoginAPI,
  } from '@/_services/api';
  import { authenticationService } from '@/_services/api';
  
  export const adminProfileService = {
	getProfile,
	getAllocatedGrade,
	getAdminAllocations,
	getAdminUser,
	saveAdminAllocationByUserId,
	deleteAdminGradeAllocation,
	notifyMeetingLink,
	saveLoginHistory,     // ← Added (used in Login.jsx)
	getLogo,              // ← Added (used in Login.jsx)
  };
  
  function getProfile() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${TeacherLoginAPI}/profile/me`, requestOptions).then(handleResponse);
  }
  
  function getAllocatedGrade(userId) {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${TeacherLoginAPI}/admin/user/${userId}/admin-grade-allocation`, requestOptions)
	  .then(handleResponse);
  }
  
  function getAdminAllocations() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${TeacherLoginAPI}/admin-grade-allocation`, requestOptions)
	  .then(handleResponse);
  }
  
  function getAdminUser(PageNo, Size) {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(
	  `${TeacherLoginAPI}/admin/school-user?size=${Size}&page=${PageNo}&sortBy=schoolUserId&sortDirection=DESC`,
	  requestOptions
	).then(handleResponse);
  }
  
  function saveAdminAllocationByUserId(values, userId) {
	const requestOptions = {
	  method: 'POST',
	  headers: authHeaderToPost(),
	  body: JSON.stringify(values),
	};
	return fetch(`${TeacherLoginAPI}/admin/user/${userId}/admin-grade-allocation`, requestOptions)
	  .then(handleResponse);
  }
  
  function deleteAdminGradeAllocation(values) {
	const requestOptions = {
	  method: 'DELETE',
	  headers: authHeaderToPost(),
	  body: JSON.stringify(values),
	};
	return fetch(`${TeacherLoginAPI}/admin/admin-grade-allocation/de-allocate`, requestOptions)
	  .then(handleResponse);
  }
  
  function notifyMeetingLink() {
	const requestOptions = {
	  method: 'POST',
	  headers: authHeaderToPost(),
	};
	return fetch(`${TeacherLoginAPI}/cron-script/admin/notify-meeting-link`, requestOptions)
	  .then(handleResponse)
	  .catch(() => {
		// Silent fail – this is just a background notification
	  });
  }
  
  // NEW: Save login history (called after successful login)
  function saveLoginHistory(userId) {
	const requestOptions = {
	  method: 'POST',
	  headers: authHeaderToPost(),
	  body: JSON.stringify({ platform: "Web" }),
	};
  
	return fetch(`${TeacherLoginAPI}/user-login-history/user/${userId}/login`, requestOptions)
	  .then(handleResponse)
	  .catch((err) => {
		console.warn("Failed to save login history (non-critical):", err);
		return { user_login_history_id: "" };
	  });
  }
  
  // NEW: Get institute logo by username
  function getLogo(username) {
	const requestOptions = { method: 'GET', headers: authHeader() };
  
	return fetch(`${TeacherLoginAPI}/school-logo?username=${username}`, requestOptions)
	  .then((res) => {
		if (!res.ok) throw new Error("Logo not found");
		return res.text(); // returns logo URL as plain text
	  })
	  .then((logoUrl) => {
		return logoUrl.trim() || "Logo not found!";
	  })
	  .catch(() => {
		return "https://dev-learnqoch.s3.ap-south-1.amazonaws.com/school_logo/LearnQoch_new_Logo.png";
	  });
  }