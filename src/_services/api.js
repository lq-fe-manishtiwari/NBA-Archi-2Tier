import { jwtDecode } from 'jwt-decode';

// GLOBAL SUBJECTS (BehaviorSubject for currentUser)
let currentUserSubject = null;
let currentUserToken = null;

export function initializeAuth() {
  currentUserSubject = { value: null };
  currentUserToken = { value: null };

  const storedUser = localStorage.getItem('currentUser');
  const storedToken = localStorage.getItem('refreshToken');


  if (storedUser) currentUserSubject.value = JSON.parse(storedUser);
  if (storedToken) {
    const parsedToken = JSON.parse(storedToken);
    currentUserToken.value = parsedToken;  // Keep full object {token, refresh_token}
  }

}


// AUTHENTICATION SERVICE OBJECT
export const authenticationService = {
  currentUser: () => currentUserSubject?.value,
  currentUserToken: () => currentUserToken?.value,
  login,
  logout,
  forgotPassword,
  getProfile
};

// ✅ MAIN LOGIN FUNCTION (GLOBAL!)
export function login(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };

  return fetch(`${newapilogin}/auth`, requestOptions)
    .then(handleLoginResponse)
    .then((user) => {
      console.log(user);
      const decoded = jwtDecode(user.token);
       console.log(decoded);
      localStorage.setItem("currentUser", JSON.stringify(decoded));
      localStorage.setItem("refreshToken", JSON.stringify(user));
      localStorage.setItem("show_payment_popup", "1");
      
      currentUserSubject.value = decoded;
      currentUserToken.value = user;
      
      return decoded;
    });
}

// ✅ LOGOUT FUNCTION
export function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("show_payment_popup");
  localStorage.removeItem("userProfile"); // Clear profile data
  localStorage.removeItem("colleges");
  
  currentUserSubject.value = null;
  currentUserToken.value = null;
  
  // Redirect to login
  window.location.href = '/';
}
// ✅ Forgot Password FUNCTION
export function forgotPassword(data) {
  const requestOptions = {
    method: "POST",
    headers:  authHeaderToPost(),
    body: JSON.stringify(data),
  };

  return fetch(
    `${newapilogin}/auth/forgot-password`,
    requestOptions
  ).then((result) => {
    return result;
  });
}

// ✅ GET PROFILE FUNCTION
export function getProfile() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(`${newapilogin}/profile/me`, requestOptions)
    .then(handleResponse);
}

// ========== RESPONSE HANDLERS ==========
export function handleTextResponse(response) {
  return response.text();
}

export function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        console.warn('Unauthorized access (status ' + response.status + ')', data);
        // DO NOT LOGOUT
      } else if ([400].includes(response.status)) {
        return data;
      }

      const error = (data?.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}
export function handleFileResponse2(response) {
  return response.text().then(text => {

    const data = text; // text hi final data hoga

    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        console.warn('Unauthorized access (status ' + response.status + ')', data);
        // DO NOT LOGOUT
      } else if (response.status === 400) {
        return data; // 400 me bhi text hi return hoga
      }

      const error = data || response.statusText;
      return Promise.reject(error);
    }

    return data; // success me text return hoga
  });
}


export function handlePostResponse(response) {
  return response.text().then(text => {
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      return Promise.reject({
        message: "Invalid JSON response",
        status: response.status,
        raw: text
      });
    }

    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        console.warn('Unauthorized access (status ' + response.status + ')', data);
        // DO NOT LOGOUT
      }
      return Promise.reject(data);
    }

    return data;
  });
}

export function handleLoginResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      const error = {
        message: data?.message || response.statusText,
        status: data?.status || response.status 
      };
      return Promise.reject(error); 
    }

    return data;
  });
}


export function handleFileResponse(response) {
  return response.blob().then(blob => {
    if (!response.ok) {
      return response.text().then(text => {
        const data = text && JSON.parse(text);
        const error = { message: data?.message, status: data?.status };
        return Promise.reject(error);
      });
    }
    return blob;
  });
}



// ========== AUTH HEADERS (CLEAN & PERFECT!) ==========
export function authHeader() {
  const token = currentUserToken?.value?.token;
  if (token) {
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'view': 'web'
    };
  }
  return { 'Content-Type': 'application/json', 'view': 'web' };
}

export function authHeaderToPost() {
  const token = currentUserToken?.value?.token;
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'view': 'web'
    };
  }
  return { 'Content-Type': 'application/json', 'view': 'web' };
}

export function authHeaderToFile() {
  const token = currentUserToken?.value?.token;

  const headers = { 'view': 'web' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}


export function authHeaderToDownloadReport() {
  const token = currentUserToken?.value?.token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ========== API ENDPOINTS CONFIGURATION ==========
export const AcademicAPI = import.meta.env.VITE_API_URL_Academic;
export const TeacherLoginAPI = import.meta.env.VITE_API_URL_TeacherORLogin;

// Legacy support - defaults to TeacherLoginAPI for backward compatibility
export const DevAPI = TeacherLoginAPI;

export const newapilogin= import.meta.env.VITE_NBA_URL;

// ========== DIFFERENTIATED API HELPERS ==========
export function academicApiRequest(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers
    }
  };
  return fetch(`${AcademicAPI}${url}`, config);
}

export function teacherApiRequest(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers
    }
  };
  return fetch(`${TeacherLoginAPI}${url}`, config);
}

// ========== DEFAULT FETCH HELPER (Legacy) ==========
export function apiRequest(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers
    }
  };
  return fetch(`${TeacherLoginAPI}${url}`, config);
}

export function apiNBARequest(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers
    }
  };
  return fetch(`${newapilogin}${url}`, config);
}