import React, { useState, useEffect } from "react";
import Sidebar from "../Layout/Sidebar";

const Homepage = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="homepage flex min-h-screen overflow-hidden">
      <Sidebar toggle={toggle} isOpen={isOpen} />
      <div
        className={`content flex-1 transition-all duration-300 p-3 bg-gray-100
          ${isOpen && !isMobile ? "ml-[250px]" : isMobile ? "ml-0" : "ml-[80px]"}
        `}
      >
        <div className="main_content bg-white p-3 sm:p-0 mt-6 sm:mt-0 rounded-lg shadow min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
