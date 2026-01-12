// src/screens/pages/PreQualifier/ViewPreQualifierOptimized.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authenticationService } from "@/_services/api";
import { nbaDashboardService } from "./Services/NBA-dashboard.service.js";

const ViewPreQualifierOptimized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateFromRoute = location.state || {};
  const cycleId = useMemo(() => stateFromRoute.cycleId || null, [stateFromRoute]);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [preQualifierSections, setPreQualifierSections] = useState([]);

  const [cycleInfo, setCycleInfo] = useState({
    cycleName: stateFromRoute.cycleName || "",
    academicYearLabel: stateFromRoute.academicYear || "",
    programName: stateFromRoute.programName || "",
    reportType: "Pre-Qualifier Report",
    collegeId: stateFromRoute.collegeId || null,
    programId: stateFromRoute.programId || null,
  });

  useEffect(() => {
    if (!cycleId) {
      navigate("/pre-qualifier-list");
      return;
    }
    loadData();
  }, [cycleId, navigate]);

  const loadData = async () => {
    try {
      setProgress(30);
      await authenticationService.getProfile();
      setProgress(60);
      await fetchPreQualifierCycleData();
      setProgress(100);
      setTimeout(() => setLoading(false), 300);
    } catch (err) {
      console.error("loadData failed:", err);
      setLoading(false);
    }
  };

  const fetchPreQualifierCycleData = async () => {
    try {
      const response = await nbaDashboardService.getAccrediatedProgramByCycleId(cycleId);

      if (!response || !Array.isArray(response.categories)) {
        setPreQualifierSections([]);
        return;
      }
console.log("Pre-Qualifier Cycle Data:", response);
      setCycleInfo(prev => ({
        ...prev,
        cycleName: response.cycleName || prev.cycleName,
        academicYearLabel: response.academicYearLabel || prev.academicYearLabel,
        programName: response.programName || prev.programName,
        reportType: response.reportTypeCategoryName || "Pre-Qualifier Report",
        // Use location state values if available, otherwise fall back to API response
        collegeId: prev.collegeId || response.college_id || response.collegeId || null,
        programId: prev.programId || response.program_id || response.programId || null,
      }));

      const sections = response.categories.map((category, i) => ({
        id: category.categoryId,
        name: category.categoryName?.trim() || `Section ${i + 1}`,
        status: category.status || "NOT_STARTED",
        score: category.score ?? null,
        sequence: i + 1,
      }));

      setPreQualifierSections(sections);
    } catch (e) {
      console.error("fetchPreQualifierCycleData failed:", e);
      setPreQualifierSections([]);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    const map = {
      COMPLETED: "bg-green-100 text-green-800 border border-green-300",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      SUBMITTED: "bg-blue-100 text-blue-800 border border-blue-300",
      NOT_STARTED: "bg-gray-100 text-gray-600 border border-gray-300",
      PENDING_REVIEW: "bg-orange-100 text-orange-800 border border-orange-300",
    };
    return map[s] || "bg-gray-100 text-gray-600 border border-gray-300";
  };

  const getSectionRoute = (sectionName) => {
    const match = sectionName.match(/Part\s+([A-Z])/i);
    if (match) {
      return `/pre-qualifier/part-${match[1].toLowerCase()}`;
    }
    return `/pre-qualifier/section-${sectionName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}`;
  };

  const handleSectionClick = (section) => {
    const route = getSectionRoute(section.name);
    const navigationData = {
      cycleId,
      sectionId: section.id,
      sectionName: section.name,
      previous_path: location.pathname,
      academic_year: cycleInfo.academicYearLabel,
      program_name: cycleInfo.programName,
      reportType: cycleInfo.reportType,
      college_id: cycleInfo.collegeId,
      program_id: cycleInfo.programId,
    };

    navigate(route, { state: navigationData });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Loading Pre-Qualifier Report</h3>
          <div className="w-96 bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-full bg-[#2162c1] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-5xl">

        {/* Back Button */}
          <div className="mb-6 flex justify-end">
          <Link
            to="/view-nba"
            className="px-6 py-3 bg-[#2163c1] text-white rounded-xl font-medium shadow-lg hover:bg-[#1a4f9a] transition flex items-center gap-2"
          >
            ← Back
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12 bg-[#2162c1] text-white rounded-3xl shadow-2xl py-6 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            PRE-QUALIFIER REPORT
          </h1>
          <p className="text-xl opacity-90">
            {cycleInfo.programName} • {cycleInfo.academicYearLabel}
          </p>
        </div>

        {/* Sections Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#2162c1] text-white">
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-8 py-6 text-center text-sm font-bold uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preQualifierSections.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-20 text-gray-500 text-lg font-medium">
                      No Pre-Qualifier sections available for this cycle.
                    </td>
                  </tr>
                ) : (
                  preQualifierSections.map((section) => (
                    <tr
                      key={section.id}
                      className="hover:bg-[#2162c1]/5 transition-all duration-200 cursor-pointer"
                      onClick={() => handleSectionClick(section)}
                    >
                      <td className="px-8 py-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#2162c1] text-white font-bold text-xl flex items-center justify-center shadow-lg mx-auto">
                          {section.sequence}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-lg font-semibold text-[#2162c1] hover:underline">
                          {section.name}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span
                            className={`px-5 py-2 rounded-full text-sm font-bold ${getStatusBadge(section.status)}`}
                          >
                            {section.status.replace(/_/g, " ")}
                          </span>
                          {section.score !== null && (
                            <span className="text-lg font-bold text-green-600">
                              Score: {section.score}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optional Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          Click on any section to view or edit details.
        </div>
      </div>
    </div>
  );
};

export default ViewPreQualifierOptimized;