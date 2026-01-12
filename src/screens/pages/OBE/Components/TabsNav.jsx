import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react"; // nice icon (from lucide-react)

export default function TabsNav({ customTabs }) {
  const navigate = useNavigate();

  // Default tab set
  const defaultTabs = [
    { label: "Dashboard", to: "/obe/dashboard" },
    { label: "Mapping", to: "/obe/Mapping" },
    { label: "Marks Entry", to: "/obe/Marks-Entry" },
    { label: "CO Attainment", to: "/obe/CO-Attainment" },
    { label: "PO/PSO Attainment", to: "/obe/PO-PSO-Attainment" },
    // { label: "Assign Teacher", to: "/obe/Assign-Teacher" },
  ];

  const tabs = customTabs || defaultTabs;
  const isSettingsView = !!customTabs;

  return (
    <div className="p-2 md:p-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              style={{ width: "9.6rem" }}
              className={({ isActive }) =>
                `tab-link whitespace-nowrap text-center flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm ${
                  isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>

        {/* Settings button */}
        {!isSettingsView && (
          <button
            onClick={() => navigate("/obe/settings")}
            className="flex items-center gap-2 text-gray-800 font-medium px-3 py-2 rounded-lg transition"
          >
            <Settings size={18} />
            <span className="hidden sm:inline"></span>
          </button>
        )}
      </div>

    </div>
  );
}
