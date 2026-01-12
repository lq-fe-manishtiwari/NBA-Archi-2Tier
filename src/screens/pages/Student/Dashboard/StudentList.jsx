import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Upload } from 'lucide-react';
import AllocatedStudent from "./AllocatedStudent";
import NonAllocatedStudent from "./NonAllocatedStudent";
import AtktStudent from "./AtktStudent"; 
import BulkUploadModal from "../Components/BulkUploadModal";

const tabs = [
  { label: "Allocated" },
  { label: "Non-Allocated" },
  { label: "ATKT" },
];

export default function StudentList() {
  const [activeTab, setActiveTab] = useState("Allocated");
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  return (
    <div className="p-2 md:p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
        {/* Tabs */}
        <div className="flex gap-2 md:gap-4">
          {tabs.map((t) => (
            <button
            key={t.label}
            onClick={() => setActiveTab(t.label)}
            className={`tab-link text-center whitespace-nowrap flex-shrink-0 min-w-[120px] ${
              activeTab === t.label ? "tab-active" : "tab-inactive"
            }`}
          >
            {t.label}
          </button>
          ))}
        </div>

        {/* Buttons on the right */}
        <div className="flex gap-2">
          <Link to="/student/list/add-student">
            <button className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </Link>

          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
        </div>
      </div>

      
    {showBulkUpload && (
        <BulkUploadModal onClose={() => setShowBulkUpload(false)} />
      )}

      {/* Tab content */}
      <div className="tab-content mt-3">
        {activeTab === "Allocated" && <AllocatedStudent />}
        {activeTab === "Non-Allocated" && <NonAllocatedStudent />}
        {activeTab === "ATKT" && <AtktStudent />}
      </div>
    </div>

  ); 
}
