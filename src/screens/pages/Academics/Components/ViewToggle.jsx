import React from "react";
import { Grid3X3, List } from "lucide-react";

export default function ViewToggle({ viewMode, onViewChange, className = "" }) {
  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onViewChange("table")}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          viewMode === "table"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        onClick={() => onViewChange("card")}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          viewMode === "card"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
}