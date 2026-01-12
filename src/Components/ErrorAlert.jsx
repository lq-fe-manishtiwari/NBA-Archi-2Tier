import React from "react";

const ErrorAlert = ({ message = "Server Down...please try again in sometime" }) => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center text-blue-700 text-lg font-medium">
          {message}
        </div>
        <div className="mt-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  };
  

export default ErrorAlert;
