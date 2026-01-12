import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import BulkUploadModal from "../Components/BulkUploadModal";

const tabs = [
  { label: "Allocated", to: "/student/Allocated" },
  { label: "Non-Allocated", to: "/student/Non-Allocated" },
  { label: "ATKT", to: "/student/ATKT" },
];

export default function TabsNav() {
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  return (
    <div className="p-2 md:p-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Tabs Section */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `tab-link text-center flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm ${
                  isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/student/add-student" className="flex-1 sm:flex-none">
            <button className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-md shadow-md transition-all text-xs sm:text-sm">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              Add Student
            </button>
          </Link>

          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-md shadow-md transition-all text-xs sm:text-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Modal Section */}
      {showBulkUpload && (
        <BulkUploadModal onClose={() => setShowBulkUpload(false)} />
      )}
    </div>
  );
}