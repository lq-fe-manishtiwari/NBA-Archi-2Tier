import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import classNames from "classnames";
import { authenticationService } from "@/_services/api";
import toggleIcon from "@/_assets/images/toggle-icon.svg";
import dashboardActive from "@/_assets/images_new_design/sidebarIcon/Dashboard_active.svg";
import dashboardInactive from "@/_assets/images_new_design/sidebarIcon/Dashboard_inactive.svg";
import academicsActive from "@/_assets/images_new_design/icons/class_active.svg";
import academicsInactive from "@/_assets/images_new_design/sidebarIcon/academicsInactive.svg";
import studentActive from "@/_assets/images_new_design/sidebarIcon/studentActive.svg";
import studentInactive from "@/_assets/images_new_design/sidebarIcon/studentIncative.svg";
import logoutIcon from "@/_assets/images_new_design/sidebarIcon/Logout.svg";

const Sidebar = ({ isOpen, toggle }) => {
  const [roles, setRoles] = useState("");
  const [staffAccess, setStaffAccess] = useState({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const learnQoch =
    "https://learnqoch.com/wp-content/uploads/al_opt_content/IMAGE/learnqoch.com/wp-content/uploads/2024/08/LearnQoch-WebT_Logo.png.bv_resized_mobile.png.bv.webp?bv_host=learnqoch.com";

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userProfile = localStorage.getItem("userProfile");

    if (currentUser) {
      const user = JSON.parse(currentUser);
      setRoles(user.sub || user.roles?.[0]?.name);
    }

    if (userProfile) {
      const profile = JSON.parse(userProfile);
      const accessAttrs = profile.staffAccessAttributes?.[0] || {};
      setStaffAccess(accessAttrs);
    }
  }, []);

  const logout = () => {
    const username = localStorage.getItem("username");
    authenticationService.logout(username).then(() => {
      window.location = "/login";
    });
  };

  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      iconActive: dashboardActive,
      iconInactive: dashboardInactive,
      match: ["/", "/dashboard"],
      role: ["SUPERADMIN"],
    },
    {
      path: "/academics",
      label: "Academics",
      iconActive: academicsActive,
      iconInactive: academicsInactive,
      match: ["/academics", "/add-grade", "/add-batch", "/add-role"],
      role: ["SUPERADMIN", "ADMIN"],
      accessKey: "academics_access",
    },
    {
      path: "/courses",
      label: "Courses",
      iconActive: academicsActive,
      iconInactive: academicsInactive,
      match: ["/courses", "/add-courses", "/add-paper", "/add-module", "/add-unit"],
      role: ["SUPERADMIN", "ADMIN"],
      accessKey: "academics_access",
    },
    {
      path: "/other-staff/dashboard",
      label: "Other Staff",
      iconActive: studentActive,
      iconInactive: studentInactive,
      match: ["/other-staff"],
      role: ["SUPERADMIN"],
    },
    {
      path: "/obe",
      label: "OBE",
      iconActive: studentActive,
      iconInactive: studentInactive,
      match: ["/obe"],
      role: ["SUPERADMIN", "ADMIN"],
      accessKey: "uniform_access",
    },
    {
      path: "/view-nba",
      label: "NBA",
      iconActive: studentActive,
      iconInactive: studentInactive,
      match: ["/view-nba"],
      role: ["SUPERADMIN", "ADMIN"],
    },
  ];

  const handleMobileToggle = () => setIsMobileOpen(!isMobileOpen);

  const isItemActive = (item, pathname) => {
    return item.match.some((url) => {
      if (url === "/") {
        return pathname === "/" || pathname === "/dashboard";
      }
      return pathname.startsWith(url);
    });
  };

  const hasAccess = (item) => {
    if (!item.role.includes(roles)) return false;
    if (item.accessKey) {
      return staffAccess?.[item.accessKey] === "true";
    }
    return true;
  };

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <div
        className={classNames(
          "hidden md:flex fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 overflow-y-auto transition-all duration-300 flex-col justify-between",
          isOpen ? "w-[220px]" : "w-[80px]"
        )}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between py-6 px-4 relative">
          {isOpen && (
            <img
              src={learnQoch}
              alt="LQ Logo"
              className="w-[140px] transition-all duration-300"
            />
          )}
          <button
            onClick={toggle}
            className={classNames(
              "bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300",
              isOpen ? "ml-2" : "mx-auto"
            )}
          >
            <img src={toggleIcon} alt="Toggle Sidebar" className="w-4 h-4" />
          </button>
        </div>

        {/* ===== Menu Items ===== */}
        <ul className="list-none flex-1 px-2">
          {menuItems.map((item, i) => {
            if (!hasAccess(item)) return null;

            const active = isItemActive(item, location.pathname);

            return (
              <li key={i} className="my-1">
                <Link
                  to={item.path}
                  className={classNames(
                    "flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-blue-600",
                    active
                      ? "border border-orange-400 bg-orange-50 font-semibold"
                      : "hover:bg-blue-50"
                  )}
                >
                  <img
                    src={active ? item.iconActive : item.iconInactive}
                    alt={item.label}
                    className="w-5 h-5"
                  />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ===== Logout ===== */}
        <div className="px-2 mb-6">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 text-blue-600 rounded-md hover:bg-blue-50 w-full"
          >
            <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
            {isOpen && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </div>

      {/* ===== Mobile Hamburger Button ===== */}
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button onClick={handleMobileToggle} className="bg-blue-600 p-2 rounded-md">
            <img src={toggleIcon} alt="Menu" className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ===== Mobile Sidebar Overlay ===== */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleMobileToggle}
        >
          <div
            className="absolute top-0 left-0 w-[250px] h-full bg-white shadow-md p-4 overflow-y-auto flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo + Close */}
            <div className="flex items-center justify-between mb-6">
              <img src={learnQoch} alt="Logo" className="w-[120px]" />
              <button
                onClick={handleMobileToggle}
                className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center"
              >
                <img
                  src={toggleIcon}
                  alt="Close"
                  className="w-4 h-4 rotate-180"
                />
              </button>
            </div>

            {/* ===== Menu Items (Mobile) ===== */}
            <ul className="list-none flex-1">
              {menuItems.map((item, i) => {
                if (!hasAccess(item)) return null;

                const active = isItemActive(item, location.pathname);

                return (
                  <li key={i} className="my-1">
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={classNames(
                        "flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-blue-600",
                        active
                          ? "border border-orange-400 bg-orange-50 font-semibold"
                          : "hover:bg-blue-50"
                      )}
                    >
                      <img
                        src={active ? item.iconActive : item.iconInactive}
                        alt={item.label}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* ===== Logout ===== */}
            <div className="mt-4">
              <button
                onClick={logout}
                className="flex items-center space-x-3 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50 w-full"
              >
                <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
