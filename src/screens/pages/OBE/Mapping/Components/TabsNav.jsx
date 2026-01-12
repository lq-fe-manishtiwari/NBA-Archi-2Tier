import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react"; // nice icon (from lucide-react)

export default function TabsNav({ customTabs }) {
  const navigate = useNavigate();

  // Default tab set
  const defaultTabs = [
    { label: "PEO-MISSION", to: "/obe/Mapping/PEO-MISSION" },
    { label: "CO-PO", to: "/obe/Mapping/CO-PO" },
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

    </div>
  );
}
