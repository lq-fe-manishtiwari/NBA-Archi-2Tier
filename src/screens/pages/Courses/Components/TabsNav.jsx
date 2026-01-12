import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react"; // nice icon (from lucide-react)

export default function TabsNav({ customTabs }) {
  const navigate = useNavigate();

  // Default tab set
  const defaultTabs = [
    { label: "Paper", to: "/courses/paper" },
    // { label: "Module", to: "/courses/module" },
    // { label: "Unit", to: "/courses/unit" },
    { label: "Report", to: "/courses/report" },
  ];

  const tabs = customTabs || defaultTabs;
  const isSettingsView = !!customTabs;

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4 w-full">
      <div className="flex flex-wrap gap-2 md:gap-4">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `tab-link text-center flex-1 md:flex-none ${isActive ? "tab-active" : "tab-inactive"
              } ${isSettingsView ? "w-[9rem]" : "w-[8rem]"}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {/* Settings button */}
      {!isSettingsView && (
        <button
          onClick={() => navigate("/courses/settings")}
          className="flex items-center gap-2 text-gray-800 font-medium px-3 py-2 rounded-lg transition"
        >
          <Settings size={18} />
          <span className="hidden sm:inline"></span>
        </button>
      )}

      {isSettingsView && (
        <button
        onClick={() => navigate("/courses")}
        className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all"
    >
        ×
    </button>  
      )}

    </div>
  );
}
