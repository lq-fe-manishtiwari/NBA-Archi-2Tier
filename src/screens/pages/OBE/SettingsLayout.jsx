import React from "react";
import { Outlet, Link } from "react-router-dom";
import { X } from "lucide-react";
import TabsNav from "./Components/TabsNav";

export default function SettingsLayout() {
    const settingsTabs = [
        { label: "VISION", to: "/obe/settings/VISION" },
        { label: "MISSION", to: "/obe/settings/MISSION" },
        { label: "PEO", to: "/obe/settings/PEO" },
        { label: "PO", to: "/obe/settings/PO" },
        { label: "PSO", to: "/obe/settings/PSO" },
        // { label: "SEMESTER", to: "/obe/settings/SEMESTER" },
        // { label: "COURSES", to: "/obe/settings/COURSES" },
        { label: "CO", to: "/obe/settings/CO" },
        { label: "BLOOM LEVEL", to: "/obe/settings/BLOOM_LEVEL" },
        { label: "INTERNAL TOOLS", to: "/obe/settings/INTERNAL_TOOLS" },
        { label: "EXTERNAL TOOLS", to: "/obe/settings/EXTERNAL_TOOLS" },
      ];

  return (
    <div className="p-0 sm:p-6">
      <div className="flex items-center justify-between w-full mb-3">
        <h2 className="pageheading">OBE Setting</h2>
      </div>

      <div className="flex items-center justify-between gap-3">
        <TabsNav customTabs={settingsTabs} />
        <Link to="/obe">
          <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all">
            <X size={20} />
          </button>
        </Link>
      </div>

      {/* Mobile: flat view (no card) | Desktop: card layout */}
      <div className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
