// src/_helpers/useApiErrorHandler.js
export const useApiErrorHandler = () => {
    return (error) => {
        console.log("error message", error);
      if (error?.includes("Failed to fetch")){
        console.log("server down error");
          return "Server is down or unreachable. Please try again later.";
        }
      if (error?.graphQLErrors?.length > 0)
        return error.graphQLErrors[0].message || "Server returned an error.";
      if (error?.includes("NetworkError")){
            console.log("setting error network");
          return "Network issue. Please check your internet.";
        }
      return "Something went wrong. Please try again.";
    };
  };
  