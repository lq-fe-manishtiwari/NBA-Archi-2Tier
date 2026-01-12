// import { BehaviorSubject } from "rxjs";

// import config from "config";
// import {
//   handleLoginResponse,
//   handleTextResponse,
//   authHeaderToPost,
//   DevAPI,
//   handleResponse,
// } from "@/_services";
// import jwt_decode from "jwt-decode";

// const currentUserSubject = new BehaviorSubject(
//   JSON.parse(localStorage.getItem("currentUser"))
// );
// const currentUserToken = new BehaviorSubject(
//   JSON.parse(localStorage.getItem("refreshToken"))
// );
// const currentBackendAPI = new BehaviorSubject(
//   JSON.parse(localStorage.getItem("CurrentAPI"))
// );

// export const authenticationService = {
//   changePassword,
//   superAdminLogin,
//   saveLoginHistory,
//   updateLoginHistory,
//   enquiryLogin,
//   getLogo,
//   currentUser: currentUserSubject.asObservable(),
//   currentUserToken: currentUserToken.asObservable(),
//   currentBackendAPI: currentBackendAPI.asObservable(),
//   get currentUserValue() {
//     return currentUserSubject.value;
//   },
//   get currentUserToken() {
//     return currentUserToken.value;
//   },
//   get currentBackendAPI() {
//     return currentBackendAPI.value;
//   },
// };







// // function changePassword(data) {
// //   const requestOptions = {
// //     method: "POST",
// //     headers: authHeaderToPost(),
// //     body: JSON.stringify(data),
// //   };

// //   return fetch(
// //     `${this.currentBackendAPI}/change-password`,
// //     requestOptions
// //   ).then((result) => {
// //     return result;
// //   });
// // }

// // function superAdminLogin(data) {
// //   const requestOptions = {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //       "Access-Control-Allow-Origin": "*",
// //       "Access-Control-Allow-Headers": "X-Requested-With,content-type",
// //       "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
// //     },
// //     body: JSON.stringify(data),
// //   };
// //   return fetch(`${DevAPI()}/super-admin/domain-info`, requestOptions)
// //     .then(handleLoginResponse)
// //     .then((result) => {
// //        let NewDomain = result.ip + "/api";
// //       // let NewDomain = "http://65.2.32.111:8181/api";
// //       localStorage.setItem("CurrentAPI", JSON.stringify(NewDomain));
// //       localStorage.setItem("domain", JSON.stringify(result.domain));
// //       localStorage.setItem("domainIps", JSON.stringify(result.ips));
// //       currentBackendAPI.next(NewDomain);
// //       // currentEnquiryBackendAPI.next(NewDomain);
// //       return result;
// //     });
// // }

// // function saveLoginHistory(userId) {
// //   var data = { platform: "Web" };
// //   // /api/user-login-history/user/{userId}/login
// //   const requestOptions = {
// //     method: "POST",
// //     headers: authHeaderToPost(),
// //     body: JSON.stringify(data),
// //   };

// //   return fetch(
// //     `${this.currentBackendAPI}/user-login-history/user/` + userId + `/login`,
// //     requestOptions
// //   ).then(handleResponse);
// //   // .then(result => {
// //   // 	return result;
// //   // });
// // }

// // function updateLoginHistory(historyId, currentBackendAPI) {
// //   const requestOptions = {
// //     method: "POST",
// //     headers: authHeaderToPost(),
// //   };

// //   return fetch(
// //     `${currentBackendAPI}/user-login-history/` + historyId + `/logout`,
// //     requestOptions
// //   )
// //     .then(handleResponse)
// //     .then((result) => {
// //       return result;
// //     });
// // }

// // function enquiryLogin(data) {
// //   const requestOptions = {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //       "Access-Control-Allow-Origin": "*",
// //       "Access-Control-Allow-Headers": "X-Requested-With,content-type",
// //       "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
// //     },
// //     body: JSON.stringify(data),
// //   };

// //   // return fetch(`${this.currentBackendAPI}/auth`, requestOptions)
// //   return fetch(`http://15.207.47.159:8080/enquiry-api/api/auth`, requestOptions)
// //     .then(handleLoginResponse)
// //     .then((user) => {
// //       // store user details and jwt token in local storage to keep user logged in between page refreshes
// //       // let decoded = jwt_decode(user['token']);
// //       // localStorage.setItem('EnquiryCurrentUser', JSON.stringify(decoded));
// //       // localStorage.setItem('EnquiryrefreshToken', JSON.stringify(user));
// //       // currentUserSubject.next(decoded);
// //       // currentUserToken.next(user)
// //       return user;
// //     });
// // }

// // function getLogo(username) {
// //   // https://dev-api.learnqoch.com:8443/api/school-logo?username=shubham@dev
// //   const requestOptions = {
// //     method: "GET",
// //     headers: authHeader(),
// //   };

// //   return fetch(
// //     `${this.currentBackendAPI}/school-logo?username=${username}`,
// //     requestOptions
// //   )
// //     .then(handleTextResponse)
// //     .then((result) => {
// //       console.log("result", result);
// //       return result;
// //     });
// // }
