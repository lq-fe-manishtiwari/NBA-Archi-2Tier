import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Dashboard", to: "/other-staff/dashboard" },
  { label: "Report", to: "/other-staff/report" },

];

export default function TabsNav() {
  return (
    <div className="flex flex-wrap gap-2 md:gap-4">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `tab-link text-center flex-1 md:flex-none ${
              isActive ? "tab-active" : "tab-inactive"
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
