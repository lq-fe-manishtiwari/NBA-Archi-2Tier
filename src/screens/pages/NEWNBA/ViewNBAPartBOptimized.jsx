// src/screens/pages/NEWNBA/ViewNBAPartBOptimized.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authenticationService } from "@/_services/api";
import { nbaDashboardService } from "./Services/NBA-dashboard.service.js";
import { allocateUsersModalService } from "./Services/AllocateUsersModal.service";
import AllocateSubCoordinator from "./Components/AllocateSubCoordinator.jsx";

// Icons from lucide-react (install with: npm install lucide-react)
import {
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
} from "lucide-react";

const ViewNBAPartBOptimized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateFromRoute = location.state || {};
  const cycleId = useMemo(() => stateFromRoute.cycleId || null, [stateFromRoute]);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [sarCategories, setSarCategories] = useState([]);
  const [allocatedUsersMap, setAllocatedUsersMap] = useState({}); // { criteriaId: users[] }
  const [completedMap, setCompletedMap] = useState({});         // { criteriaId: boolean }
  const [isCoordinator, setIsCoordinator] = useState(false);

  // Modal
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState(null);

  const [cycleInfo, setCycleInfo] = useState({
    cycleName: stateFromRoute.cycleName || "",
    academicYearLabel: stateFromRoute.academicYear || "",
    programName: stateFromRoute.programName || "",
    reportType: stateFromRoute.reportType || "SAR Report",
    programId: stateFromRoute.programId || null,
  });

  useEffect(() => {
    console.log("🔍 VIEW PART B DEBUG: cycleId =", cycleId);
    console.log("🔵 ViewNBAPartBOptimized - Received route state:", stateFromRoute);
    console.log("  - programId from state:", stateFromRoute.programId);
    console.log("  - collegeId from state:", stateFromRoute.collegeId);
    console.log("  - cycleId from state:", stateFromRoute.cycleId);
    console.log("  - Full cycleInfo state:", cycleInfo);

    if (!cycleId) {
      navigate("/view-nba");
      return;
    }

    // Check if user is NBA Coordinator or Super Admin
    const currentUser = authenticationService.currentUser();
    const profile = authenticationService.getProfile() || {};
    const isSuperAdmin = currentUser?.sub === "SUPERADMIN";
    const isCoord = profile.is_nba2_coordinator || isSuperAdmin;
    setIsCoordinator(isCoord);

    loadData(isCoord);
  }, [cycleId, navigate]);

  // Separate useEffect to ensure programId is always in cycleInfo when stateFromRoute has it
  useEffect(() => {
    if (stateFromRoute.programId && (!cycleInfo.programId || cycleInfo.programId === null)) {
      console.log("🟠 ViewNBAPartBOptimized: Ensuring programId is set in cycleInfo. Updating from:", stateFromRoute.programId);
      setCycleInfo(prev => ({
        ...prev,
        programId: stateFromRoute.programId,
      }));
    }
  }, [stateFromRoute.programId]);

  const loadData = async (isCoord) => {
    console.log("🔍 Loading SAR data for cycleId:", cycleId);
    try {
      // setProgress(20);
      const categories = await fetchSARCycleData();
      if (isCoord && categories) await fetchSubCoordinatorAllocations(categories);
      // setProgress(100);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      console.error("Load failed:", err);
      setLoading(false);
    }
  };

  const fetchSARCycleData = async () => {
    console.log("🔍 i am here",);
    try {
      const res = await nbaDashboardService.getAccrediatedProgramByCycleId(cycleId);
      console.log("🔍 SAR Cycle Data Response:", res);
      if (!res || !Array.isArray(res.categories)) {
        setSarCategories([]);
        return null;
      }

      setCycleInfo(prev => ({
        cycleName: res.cycleName || prev.cycleName,
        academicYearLabel: res.academicYearLabel || prev.academicYearLabel,
        programName: res.programName || prev.programName,
        reportType: res.reportTypeCategoryName || "SAR Report",
        programId: res.programId || prev.programId, // Preserve programId from initial state
      }));
      console.log("🔍 Updated Cycle Info with programId:", {
        programId: res.programId || stateFromRoute.programId,
        cycleName: res.cycleName,
        academicYearLabel: res.academicYearLabel,
        programName: res.programName,
      });



      const transformed = res.categories.map((cat, i) => ({
        id: cat.cycleCategoryId,
        name: cat.categoryName?.trim() || `Criterion ${i + 1}`,
        criteriaType: cat.criteriaType || "PART-B",
        sequence: i + 1,
        score: cat.score,
        remarks: cat.remarks,
      }));
      console.log("🔍 Transformed SAR Categories:", transformed);
      setSarCategories(transformed);
      return transformed;
    } catch (e) {
      console.error("Error fetching SAR data:", e);
      setSarCategories([]);
      return null;
    }
  };

  // Handles new API response structure with criteria_allocations array
  const fetchSubCoordinatorAllocations = async (categories) => {
    const partBCriteria = categories.filter(c => c.criteriaType === "PART-B");
    if (partBCriteria.length === 0) return;

    const usersMap = {};
    const completedMap = {};

    try {
      console.log("🔍 DEBUG: Fetching sub-coordinator allocations for cycleId:", cycleId);
      const res = await allocateUsersModalService.getAllocateUsersSubCoordinator(cycleId);
      console.log("📊 DEBUG: Sub-coordinator API response:", res);

      // Handle new API response structure
      if (res && res.criteria_allocations && Array.isArray(res.criteria_allocations)) {
        res.criteria_allocations.forEach(criteriaAllocation => {
          const criteriaId = criteriaAllocation.cycle_category_id;
          const subCoordinators = criteriaAllocation.sub_coordinators || [];


          // Map sub-coordinators to expected format
          const users = subCoordinators.map(subCoord => ({
            school_user: {
              firstname: subCoord.sub_coordinator_name?.split(' ')[0] || "User",
              lastname: subCoord.sub_coordinator_name?.split(' ').slice(1).join(' ') || "",
              school_user_id: subCoord.sub_coordinator_id,
            },
            completed: false, // Sub-coordinators don't have completion status
            isSubCoordinator: true,
            nba_sub_coordinator_allocation_id: subCoord.allocation_id,
            email: subCoord.email,
            mobile: subCoord.mobile,
            department: subCoord.department,
            assigned_on: subCoord.assigned_on,
          }));

          // Only set data for criteria that have sub-coordinators
          if (users.length > 0) {
            usersMap[criteriaId] = users;
            completedMap[criteriaId] = false; // Sub-coordinators don't affect completion
          }
        });
      } else {
        console.log("⚠️ DEBUG: No criteria_allocations found in response");
      }
    } catch (err) {
      console.error("❌ DEBUG: Failed to load sub-coordinators:", err);
    }

    console.log("🎯 DEBUG: Final usersMap:", usersMap);
    console.log("🎯 DEBUG: Final completedMap:", completedMap);

    setAllocatedUsersMap(usersMap);
    setCompletedMap(completedMap);
  };

  const openAllocateModal = useCallback((criterion) => {
    setSelectedCriterion(criterion);
    setIsAllocateModalOpen(true);
  }, []);

  const closeAllocateModal = () => {
    setIsAllocateModalOpen(false);
    setSelectedCriterion(null);

    // Refresh sub-coordinator allocations after modal closes
    if (sarCategories && sarCategories.length > 0) {
      fetchSubCoordinatorAllocations(sarCategories);
    }
  };

  const grouped = {
    "PART-A": sarCategories.filter(c => c.criteriaType === "PART-A"),
    "PART-B": sarCategories.filter(c => c.criteriaType === "PART-B").sort((a, b) => a.sequence - b.sequence).slice(0, 9),
    "PART-C": sarCategories.filter(c => c.criteriaType === "PART-C"),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Loading SAR Report</h3>
          <div className="w-96 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div className="h-full bg-[#2163c1] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-700">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
          <div className="text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2162c1]">
            Self Assessment Report (SAR)
          </h1>

          <p className="mt-3 text-xl text-black">
            {`${cycleInfo.programName} > ${cycleInfo.academicYearLabel} > ${cycleInfo.reportType}`}
          </p>

            <p className="mt-1 text-lg text-[#2162c1] font-medium">

            </p>
        </div>
        <Link
          to="/view-nba"
          className="px-6 py-3 bg-[#2163c1] text-white rounded-xl font-medium shadow-lg hover:bg-[#1a4f9a] transition flex items-center gap-2"
        >
          ← Back
        </Link>
      </div>


      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* PART A */}
        {grouped["PART-A"].length > 0 && (
          <>
            <div className="bg-[#2162c1] text-white px-8 py-5">
              <h2 className="text-2xl font-bold">Part A – Institutional Information</h2>
            </div>
            {grouped["PART-A"].map((section) => (
              <div key={section.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <Link
                  to="/nba/criteria-part-a"
                  state={{
                    nba_accredited_program_id: cycleId,
                    nba_criteria_id: section.id,
                    nba_criteria_sub_level1_id: section.id,
                    academic_year: cycleInfo.academicYearLabel,
                    program_name: cycleInfo.programName,
                    programId: cycleInfo.programId,
                    collegeId: stateFromRoute.collegeId,
                    cycleName: cycleInfo.cycleName,
                    reportType: cycleInfo.reportType,
                  }}
                  className="px-8 py-6 flex items-center justify-between gap-6 block"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="text-center w-20">
                      <span className="text-2xl font-bold text-[#2162c1]">1</span>
                    </div>
                      <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">Institution Information</h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </>
        )}

          {/* PART B - Criteria Summary */}
        {grouped["PART-B"].length > 0 && (
          <>
            <div className="bg-[#2162c1] text-white px-8 py-5">
              <h2 className="text-2xl font-bold">Part B – Criteria Summary</h2>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-6 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-50 font-semibold text-sm text-gray-700 border-b-2 border-gray-300">
              <div className="col-span-5 pl-8">Criterion</div>
              <div className="col-span-2 text-center">Sub-Coordinators</div>
              <div className="col-span-2 text-center">Allocate</div>
              <div className="col-span-1 text-center">MO</div>
              <div className="col-span-1 text-center">TM</div>
              <div className="col-span-1 text-center">% ACH</div>
            </div>

            {/* Criteria Rows */}
            {grouped["PART-B"].map((section, idx) => {
              const criterionNo = idx + 1;
              const users = allocatedUsersMap[section.id] || [];

              // Find full category data including score & remarks
              const fullCategoryData = sarCategories.find(cat => cat.id === section.id) || {};
              const rawScore = fullCategoryData.score;     // TM
              const rawRemarks = fullCategoryData.remarks; // MO (used as max marks)

              // Safely parse numbers
              const tm = rawScore != null ? Number(rawScore) : null;
              const mo = rawRemarks != null ? Number(rawRemarks) : null;
              const pa = mo && tm != null && mo > 0 ? (mo / tm) * 100 : null;

              // Status logic for icons
              const getStatusForValue = (value, isPercentage = false) => {
                if (value === null || value === undefined) return "not-started";
                if (isPercentage) {
                  if (value >= 100) return "completed";
                  if (value >= 70) return "pending";
                  return "not-started";
                }
                return value > 0 ? "completed" : "not-started";
              };

              const renderValueWithIcon = (value, suffix = "", isPercentage = false) => {
                const status = getStatusForValue(value, isPercentage);

                if (value === null || value === undefined || isNaN(value)) {
                  return <XCircle className="w-7 h-7 text-red-500 mx-auto" />;
                }

                const displayValue = isPercentage ? value.toFixed(1) : value;

                return (
                  <div className="flex flex-col items-center">
                    <span className={`font-bold text-lg ${
                      isPercentage
                        ? value >= 100 ? "text-green-600" :
                          value >= 70 ? "text-yellow-600" : "text-red-600"
                        : "text-gray-800"
                    }`}>
                      {displayValue}{suffix}
                    </span>
                  </div>
                );
              };

              return (
                <div
                  key={section.id}
                  className="grid grid-cols-12 gap-6 px-8 py-6 border-b border-gray-200 hover:bg-indigo-50 transition-all duration-200"
                >
                  {/* Criterion Name */}
                  <div className="col-span-5 flex items-center">
                    <Link
                      to={`/nba/criterion-${criterionNo}`}
                      state={{
                        nba_accredited_program_id: cycleId,
                        nba_criteria_id: section.id,
                        nba_criteria_sub_level1_id: section.id,
                        academic_year: cycleInfo.academicYearLabel,
                        program_name: cycleInfo.programName,
                        cycleName: cycleInfo.cycleName,
                        reportType: cycleInfo.reportType,
                        programId: cycleInfo.programId,
                      }}
                      className="flex items-center gap-5 flex-1 hover:text-[#2163c1] transition"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        completedMap[section.id] ? "bg-green-500" : "bg-[#2163c1]"
                      }`}>
                        {criterionNo}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Criterion {criterionNo} – {section.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Sub-Coordinators */}
                  <div className="col-span-2 flex items-center justify-center">
                    {users.length > 0 ? (
                      <div className="flex -space-x-3">
                        {users.slice(0, 4).map((u, i) => {
                          const first = (u.school_user.firstname?.[0] || "?").toUpperCase();
                          const last = (u.school_user.lastname?.[0] || "?").toUpperCase();
                          const fullName = `${u.school_user.firstname || ""} ${u.school_user.lastname || ""}`.trim();

                          return (
                            <div
                              key={u.school_user.school_user_id || i}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 text-white text-xs font-bold flex items-center justify-center border-3 border-white shadow-md"
                              title={`${fullName} (Sub-Coordinator)`}
                            >
                              {first}{last}
                            </div>
                          );
                        })}
                        {users.length > 4 && (
                          <div className="w-10 h-10 rounded-full bg-gray-600 text-white text-xs font-bold flex items-center justify-center border-3 border-white shadow-md">
                            +{users.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Not assigned</span>
                    )}
                  </div>
                    {/* Allocate Icon */}
                  <div className="col-span-2 flex justify-center items-center">
                    {isCoordinator && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          openAllocateModal(section);
                        }}
                        className="group p-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl hover:border-[#2163c1] hover:bg-blue-50 transition-all duration-300 shadow-md"
                        title="Allocate Sub-Coordinator"
                      >
                        <UserPlus className="w-8 h-8 text-gray-600 group-hover:text-[#2163c1] transition" />
                      </button>
                    )}
                  </div>

                  {/* MO - Max Marks (from remarks) */}
                  <div className="col-span-1 flex justify-center items-center">
                    {renderValueWithIcon(mo)}
                  </div>

                  {/* // TM - Obtained Marks (from score) */}
                  <div className="col-span-1 flex justify-center items-center">
                    {renderValueWithIcon(tm)}
                  </div>

                  {/* PA - Percentage Achievement */}
                  <div className="col-span-1 flex justify-center items-center">
                    {renderValueWithIcon(pa, "%", true)}
                  </div>

                
                </div>
              );
            })}
          </>
        )}

        {/* PART C */}
        {grouped["PART-C"].length > 0 && (
          <>
            <div className="bg-[#2162c1] text-white px-8 py-5">
              <h2 className="text-2xl font-bold">Part C – Declaration by the Institution</h2>
            </div>
            {grouped["PART-C"].map((section) => (
              <div key={section.id} className="border-b border-gray-200 hover:bg-indigo-50 transition">
                <Link
                  to={`/nba/criterion-${section.id}`}
                  state={{
                    nba_accredited_program_id: cycleId,
                    nba_criteria_id: section.id,
                    nba_criteria_sub_level1_id: section.id,
                    academic_year: cycleInfo.academicYearLabel,
                    program_name: cycleInfo.programName,
                    cycleName: cycleInfo.cycleName,
                    reportType: cycleInfo.reportType,
                  }}
                  className="px-8 py-6 flex items-center justify-between gap-6 block"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="text-center w-20">
                      <span className="text-2xl font-bold text-indigo-700">-</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Declaration by the Institution</h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </>
        )}
      </div>

      {sarCategories.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
          <p className="text-lg text-gray-500">No sections available for this cycle.</p>
        </div>
      )}
    </div>

    {/* Allocate Sub-Coordinator Modal */}
    {isAllocateModalOpen && selectedCriterion && (
      <AllocateSubCoordinator
        isOpen={isAllocateModalOpen}
        onClose={closeAllocateModal}
        criteriaId={selectedCriterion.id}
        criterionName={`Criterion ${grouped["PART-B"].findIndex(c => c.id === selectedCriterion.id) + 1} – ${selectedCriterion.name}`}
        academicYear={cycleInfo.academicYearLabel}
        currentAllocated={allocatedUsersMap[selectedCriterion.id] || []}
        onSuccess={closeAllocateModal}
      />
    )}
  </div>
  );
};

export default ViewNBAPartBOptimized;