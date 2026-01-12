import React from "react";

const CriteriaLoader = () => {
  return (
    <>
      <style>
        {`
          @keyframes rotateDoc {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes checkPulse {
            0% { transform: scale(0.9); opacity: 0.5; }
            100% { transform: scale(1.2); opacity: 1; }
          }

          @keyframes barGrow {
            0% { width: 0; }
            100% { width: 100%; }
          }

          .doc-circle {
            animation: rotateDoc 2.2s linear infinite;
          }

          .check-item {
            animation: checkPulse 1s ease-in-out infinite alternate;
          }

          .load-bar {
            animation: barGrow 1.8s ease-in-out infinite alternate;
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-100 flex items-center justify-center">

          {/* Rotating Document Icon */}
          <div className="mx-auto mb-4 w-20 h-20 rounded-full border-4 border-[#2163c1] border-t-transparent doc-circle flex items-center justify-center">
            <i className="fa-solid fa-file-alt text-3xl text-[#2163c1]"></i>
          </div>


      
      </div>
    </>
  );
};

export default CriteriaLoader;
