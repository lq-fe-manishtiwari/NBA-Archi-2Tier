import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "College", to: "/academics/college" },
  { label: "Role", to: "/academics/role" },
  { label: "Category", to: "/academics/category" },
  { label: "Sub-Category", to: "/academics/subcategory" },
  { label: "Program", to: "/academics/program" },
  { label: "Class", to: "/academics/class" },
  // { label: "Division", to: "/academics/division" },
  { label: "Academic Year", to: "/academics/academicyear" },
  { label: "Department", to: "/academics/department" },
  { label: "Course", to: "/academics/course" },
  { label: "Allocation", to: "/academics/allocation" },
];

export default function TabsNav() {
  return (
    <div className="flex flex-wrap gap-2 md:gap-4">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `tab-link text-center flex-1 md:flex-none ${isActive ? "tab-active" : "tab-inactive"
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
