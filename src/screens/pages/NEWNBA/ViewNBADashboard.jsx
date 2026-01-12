// src/screens/pages/NEWNBA/ViewNBADashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import SweetAlert from "react-bootstrap-sweetalert";
import { ChevronDown, Building2, GraduationCap, BookOpen, FileText, Calendar } from "lucide-react";

import { authenticationService } from "@/_services/api";
import { adminProfileService } from "@/_services/adminProfile";
import { initializeAdminProfile, getAllProfileFlags } from "@/_services/adminProfileUtils";
import { nbaDashboardService } from "./Services/NBA-dashboard.service.js";
import ListNBAAccredatedOptimized from "./ListNBAAccredatedOptimized";
import ContributorDashboard from "./Components/ContributorDashboard";
import { useUserProfile } from "../../../contexts/UserProfileContext.jsx";
import { useColleges } from "../../../contexts/CollegeContext.jsx";

// Custom Select Component with Icon
const CustomSelectWithIcon = ({ icon: Icon, iconColor, label, value, onChange, options, placeholder, disabled = false, required = false, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Debug logging for programs
  if (label === "Program") {
    console.log("Program dropdown options:", options);
    console.log("Program dropdown value:", value);
  }

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4" ref={dropdownRef}>
      <Icon className={`w-8 h-8 ${iconColor}`} />
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div
            className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={value ? 'text-gray-900' : 'text-gray-400'}>
              {value ? options.find(opt => opt.id === value)?.name || value : placeholder}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          </div>

          {isOpen && !disabled && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect('')}
              >
                {placeholder}
              </div>
              {options && options.length > 0 && options.map((option, index) => {
                if (label === "Program") {
                  console.log(`Rendering program option ${index}:`, option);
                }
                return (
                  <div
                    key={`${option.id}-${index}`}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelect(option.id)}
                  >
                    {option.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ViewNBADashboard = () => {
  const navigate = useNavigate();
  const currentUser = authenticationService.currentUser();
  const isSuperAdmin = currentUser?.sub === "SUPERADMIN";
  const [currenuserId, setCurrentUserId] = useState()
  const [colleges, setColleges] = useState([]);
  const { profileData, userRole, loading, error, fetchProfile, fullName, designation, userType } = useUserProfile();
    const { fetchColleges } = useColleges();



  const [isFormOpen, setIsFormOpen] = useState(false);

  const [state, setState] = useState({
    categories: [],
    subCategories: [],
    institutes: [],
    programs: [],
    academicYears: [],
    reportTypes: [],
    cycles: [
      { id: "1", name: "Cycle 1" },
      { id: "2", name: "Cycle 2" },
      { id: "3", name: "Cycle 3" },
      { id: "4", name: "Cycle 4" },
    ],

    selectedCategory: "",
    selectedSubCategory: "",
    selectedInstitute: "",
    selectedProgram: "",
    selectedAcademicYear: "",
    selectedReportType: "",
    selectedCycle: "",

    username: "",
    nbacoardinator: false,

    // Admin profile extracted flags for use across pages
    adminProfile: null,
    isCoordinator: false,
    isSubCoordinator: false,
    isContributor: false,
    staffAccess: {},

    // Contributor tasks
    contributorTasks: [],
    loadingContributorTasks: false,
    contributorTasksError: null,

    // Sub-coordinator tasks
    subCoordinatorTasks: [],
    loadingSubCoordinatorTasks: false,
    subCoordinatorTasksError: null,

    loadingCategories: true,
    loadingSubCategories: false,
    loadingPrograms: false,
    programFetchError: null,
    alert: null,
  });

  const updateState = (newState) => setState((prev) => ({ ...prev, ...newState }));

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const fetchProfileAndData = async () => {
    try {
      // Initialize admin profile globally - can be used across all components
      const profileFlags = await initializeAdminProfile();
      const profile = await authenticationService.getProfile();

       const data = await fetchColleges();
        setColleges(Array.isArray(data) ? data : []);
        console.log("Fetched colleges in dashboard:", data);

      const username = `${profile.firstname} ${profile.lastname}`;
      const isCoord = !!(profile.is_nba_coordinator || profile.is_nba2_coordinator);
      const finalIsCoordinator = isCoord || isSuperAdmin || profileFlags.isCoordinator;

      // Update localStorage with contributor flag for compatibility with existing components
      const existingUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const updatedUserInfo = {
        ...existingUserInfo,
        nba_contributor: profileFlags.isContributor,
        nba_coordinator: profileFlags.isCoordinator,
        nba_sub_coordinator: profileFlags.isSubCoordinator,
        other_staff_id: profile.other_staff_id,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      updateState({
        username,
        selectedInstitute: data?.id,
        nbacoardinator: finalIsCoordinator,
        currentUserId: profile.other_staff_id,
        // Store extracted flags locally (also available globally via adminProfileUtils)
        adminProfile: profileFlags.adminProfile,
        isCoordinator: profileFlags.isCoordinator,
        isSubCoordinator: profileFlags.isSubCoordinator,
        isContributor: profileFlags.isContributor,
        staffAccess: profileFlags.staffAccess
      });

      const promises = [
        fetchCategories(),
        fetchAllocatedGrades(profile.user.user_id),
        fetchAcademicYears(),
        fetchReportTypes(),
        fetchPrograms(profile.other_staff_id),
      ];

      // If user is contributor, fetch their tasks
      if (profileFlags.isContributor && profileFlags.adminProfile?.other_staff_id) {
        promises.push(fetchContributorTasks(profileFlags.adminProfile.other_staff_id));
      }

      // If user is sub-coordinator, fetch their tasks
      if (profileFlags.isSubCoordinator && profileFlags.adminProfile?.other_staff_id) {
        promises.push(fetchSubCoordinatorTasks(profileFlags.adminProfile.other_staff_id));
      }

      await Promise.all(promises);
    } catch (err) {
      showAlert("error", "Error", "Failed to load initial data.");
    }
  };

  // Fetch Categories → Hardcoded to UG
  const fetchCategories = async () => {
    try {
      updateState({ loadingCategories: true });

      // 🔥 API Call
      const response = await nbaDashboardService.getCategory();

      // Assuming API returns something like:
      // [{ id: 1, college_type: "UG" }, { id: 2, college_type: "PG" }]
      const categories = response.map(item => ({
        id: item.id,
        name: item.category_name,
      }));

      // Default selection: first category (if exists)
      const defaultCategory = categories.length > 0 ? categories[0].name : "";

      updateState({
        categories,
        selectedCategory: defaultCategory,
        loadingCategories: false
      });

      // ↓ Fetch sub-categories only if a default selection exists
      if (defaultCategory) {
        fetchSubCategories(defaultCategory);
      }

    } catch (err) {
      updateState({ categories: [], loadingCategories: false });
      showAlert("error", "Failed", "Could not load categories.");
    }
  };


  // Fetch Sub-Categories → Hardcoded to Engineering
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      updateState({ subCategories: [], selectedSubCategory: "" });
      return;
    }

    try {
      updateState({ loadingSubCategories: true });

      // 🔥 API Call — Get Sub Types for selected College Type
      const response = await nbaDashboardService.getAllCollegeTypes(categoryId);

      // Example API response assumption:
      // [{ id: 12, subtype_name: "Engineering" }, { id: 13, subtype_name: "Pharmacy" }]
      const subCategories = response.map(item => ({
        id: item.id,
        name: item.type_name
      }));

      // Auto-select first subcategory if available
      const defaultSubCategory = subCategories.length > 0 ? subCategories[0].id : "";

      updateState({
        subCategories,
        selectedSubCategory: defaultSubCategory,
        loadingSubCategories: false,
      });

    } catch (err) {
      updateState({
        subCategories: [],
        selectedSubCategory: "",
        loadingSubCategories: false
      });
      showAlert("warning", "Failed", "Could not load sub-categories.");
    }
  };


  const fetchAllocatedGrades = async (userId) => {
    try {
      const response = await nbaDashboardService.getAllocatedGrade(userId);
      console.log("Allocated Grades Response:", response);
      if (!response || response.length === 0) {
        if (isSuperAdmin) {
          updateState({
            institutes: [{ id: "1", name: "All Institutes (SUPERADMIN)" }],
            selectedInstitute: "",
          });
        } else {
          showAlert("warning", "No Access", "You are not allocated to any program.");
        }
        return;
      }

      const instituteMap = new Map();
      response.forEach((alloc) => {
        const college = alloc.program?.college;
        if (college && !instituteMap.has(college.id)) {
          instituteMap.set(college.id, {
            id: college.id,
            name: college.college_name || "Unknown Institute",
          });
        }
      });

      const institutes = Array.from(instituteMap.values());
      console.log("Extracted Institutes:", institutes);
      updateState({
        institutes: institutes.length > 0 ? institutes : [{ id: "1", name: "Main Campus" }],
        selectedInstitute: institutes.length === 1 ? institutes[0].id : "",
      });

      if (institutes.length === 1) {
        localStorage.setItem("instituteTypeId", institutes[0].id);
      }
    } catch (err) {
      if (isSuperAdmin) {
        updateState({
          institutes: [{ id: "1", name: "All Institutes (SUPERADMIN)" }],
          selectedInstitute: "",
        });
      }
    }
  };

  const fetchPrograms = async (otherStaffId) => {
    try {
      updateState({ loadingPrograms: true, programFetchError: null, programs: [] });
      let response;
      if (userRole === "SUPERADMIN") {
        response = await nbaDashboardService.getAllocatedGrade(
          authenticationService.currentUser()?.user_id || 2
        );
      } else {
        response = await nbaDashboardService.getallocationProgrambyOtherStaffID(otherStaffId);
      }


      if (!response || response.length === 0) {
        updateState({
          programs: [],
          programFetchError: "No programs allocated to you.",
          loadingPrograms: false,
        });
        return;
      }

      console.log("Raw programs response:", response);
      
      // Step by step processing with logging
      const validAllocations = response.filter((alloc) => alloc && alloc.program);
      console.log("Valid allocations:", validAllocations.length);
      
      const extractedPrograms = validAllocations.map((alloc) => alloc.program);
      console.log("Extracted programs:", extractedPrograms);
      
      const validPrograms = extractedPrograms.filter((p) => p && (p.program_id || p.id) && (p.program_name || p.name));
      console.log("Valid programs after filtering:", validPrograms);
      
      const programs = validPrograms.map((p) => ({
        id: p.program_id || p.id,
        name: p.program_name || p.name,
      }));
      
      console.log("Processed programs:", programs);
      console.log("Program IDs found:", programs.map(p => p.id));

      const uniquePrograms = Array.from(new Map(programs.map(p => [p.id, p])).values());
      console.log("Unique programs after deduplication:", uniquePrograms);

      updateState({
        programs: uniquePrograms,
        selectedProgram: uniquePrograms.length === 1 ? uniquePrograms[0].id : "",
        programFetchError: uniquePrograms.length === 0 ? "No programs found." : null,
        loadingPrograms: false,
      });
      
      console.log("Programs state updated with:", uniquePrograms);
    } catch (err) {
      console.error("Error loading programs:", err);
      updateState({
        programs: [],
        programFetchError: "Failed to load programs.",
        loadingPrograms: false,
      });
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await nbaDashboardService.getNBAAcademicYear();
      const years = response.map((y) => ({ id: y.id, name: y.year }));
      updateState({
        academicYears: years.length ? years : [{ id: "1", name: "2024-2025" }],
        selectedAcademicYear: years.length === 1 ? years[0].id : "",
      });
    } catch {
      updateState({ academicYears: [{ id: "1", name: "2024-2025" }], selectedAcademicYear: "1" });
    }
  };

  const fetchReportTypes = async () => {
    try {
      const response = await nbaDashboardService.getNBAReportType();
      const types = response.map((t) => ({ id: t.id, name: t.name }));
      updateState({
        reportTypes: types.length ? types : [{ id: "2", name: "SAR Report" }],
        selectedReportType: types.length === 1 ? types[0].id : "",
      });
    } catch { }
  };

  const fetchContributorTasks = async (otherStaffId) => {
    try {
      updateState({ loadingContributorTasks: true, contributorTasksError: null });
      const response = await nbaDashboardService.getContributorTasks(otherStaffId);
      updateState({
        contributorTasks: (response || []).reverse(),
        loadingContributorTasks: false,
      });
    } catch (err) {
      console.error("Error loading contributor tasks:", err);
      updateState({
        contributorTasks: [],
        contributorTasksError: "Failed to load contributor tasks.",
        loadingContributorTasks: false,
      });
    }
  };

  const fetchSubCoordinatorTasks = async (otherStaffId) => {
    try {
      updateState({ loadingSubCoordinatorTasks: true, subCoordinatorTasksError: null });
      const response = await nbaDashboardService.getSubCoordinatorTasks(otherStaffId);
      updateState({
        subCoordinatorTasks: response || [],
        loadingSubCoordinatorTasks: false,
      });
    } catch (err) {
      console.error("Error loading sub-coordinator tasks:", err);
      updateState({
        subCoordinatorTasks: [],
        subCoordinatorTasksError: "Failed to load sub-coordinator tasks.",
        loadingSubCoordinatorTasks: false,
      });
    }
  };

  const showAlert = (type, title, message) => {
    updateState({
      alert: (
        <SweetAlert type={type} title={title} onConfirm={() => updateState({ alert: null })}>
          <p className="text-gray-700">{message}</p>
        </SweetAlert>
      ),
    });
  };

  const handleTaskCardClick = (task) => {
    try {
      // Extract necessary data from the task - Updated for new API structure
      const cycleCategory = task.cycle_category;
      const cycleSubCategory = task.cycle_sub_category;

      if (!cycleCategory) {
        showAlert("error", "Navigation Error", "Unable to navigate - missing criteria data.");
        return;
      }

      // Get the category_name from the API response to determine which criteria to navigate to
      const categoryName = cycleCategory.category?.category_name ||
        cycleCategory.category_name || "";

      let criteriaRoute = "";
      console.log("🔍 Category Name from API:", categoryName);
      console.log("🔍 Full cycle_category object:", cycleCategory);
      console.log("🔍 Full cycle_sub_category object:", cycleSubCategory);

      // Map category names to routes based on the actual category names
      const categoryRouteMap = {
        // Criterion 1 - Vision, Mission and Program Educational Objectives
        "Outcome-Based Curriculum": "/nba/criterion-1",
        "Vision Mission and Program Educational Objectives": "/nba/criterion-1",
        "Outcome-based Curriculum": "/nba/criterion-1",

        // Criterion 2 - Teaching-learning and Evaluation
        "Outcome-Based Teaching Learning": "/nba/criterion-2",

        // Criterion 3 - Research, Innovations and Extension
        "Outcome-Based Assessment": "/nba/criterion-3",

        // Criterion 4 - Learning Resources
        "Students' Performance": "/nba/criterion-4",

        // Criterion 5 - Student Support and Progression
        "Faculty Information": "/nba/criterion-5",

        // Criterion 6 - Governance, Leadership and Management - Multiple possible names
        "Faculty Contributions": "/nba/criterion-6",
        "Governance, Leadership and Management": "/nba/criterion-6",
        "Governance Leadership and Management": "/nba/criterion-6",
        "Faculty Details": "/nba/criterion-6",
        "Faculty Data": "/nba/criterion-6",
        "Leadership and Management": "/nba/criterion-6",
        "Governance and Leadership": "/nba/criterion-6",

        // Criterion 7 - Facilities and Technical Support
        "Facilities and Technical Support": "/nba/criterion-7",

        // Criterion 8 - Continuous Improvement
        "Continuous Improvement": "/nba/criterion-8",

        // Criterion 9 - Quality in Research
        "Student Support and Governance": "/nba/criterion-9"
      };

      // Find matching route
      criteriaRoute = categoryRouteMap[categoryName];
      console.log("🔍 Mapped Criteria Route:------", categoryName);

      if (!criteriaRoute) {
        // Fallback: try partial matching
        const categoryLower = categoryName.toLowerCase();
        if (categoryLower.includes("vision") || categoryLower.includes("mission") || categoryLower.includes("curriculum")) {
          criteriaRoute = "/nba/criterion-1";
        } else if (categoryLower.includes("teaching") || categoryLower.includes("evaluation")) {
          criteriaRoute = "/nba/criterion-2";
        } else if (categoryLower.includes("research") || categoryLower.includes("innovation")) {
          criteriaRoute = "/nba/criterion-3";
        } else if (categoryLower.includes("learning resources") || categoryLower.includes("students' performance")) {
          criteriaRoute = "/nba/criterion-4";
        } else if (categoryLower.includes("student support") && !categoryLower.includes("governance")) {
          criteriaRoute = "/nba/criterion-5";
        } else if (categoryLower.includes("faculty") || categoryLower.includes("Contributions") || categoryLower.includes("leadership") || categoryLower.includes("management")) {
          criteriaRoute = "/nba/criterion-6";
        } else if (categoryLower.includes("facilities") || categoryLower.includes("technical support")) {
          criteriaRoute = "/nba/criterion-7";
        } else if (categoryLower.includes("continuous improvement")) {
          criteriaRoute = "/nba/criterion-8";
        } else if (categoryLower.includes("quality") && categoryLower.includes("research")) {
          criteriaRoute = "/nba/criterion-9";
        } else {
          console.warn("⚠️ No matching route found for category:", categoryName);
          showAlert("warning", "Navigation Warning", `No matching criteria found for category: ${categoryName}`);
          return;
        }
      }

      // Get the cycle ID from the cycle_category.cycle.id
      const cycleId = cycleCategory.cycle?.id;

      if (!cycleId) {
        showAlert("error", "Navigation Error", "Unable to find cycle ID in task data.");
        return;
      }

      // Different navigation logic for contributors vs sub-coordinators
      let navigationState;

      if (isContributor && !isSubCoordinator) {
        // CONTRIBUTOR FLOW: Navigate to specific sub-criteria with limited access
        navigationState = {
          nba_accredited_program_id: cycleId,
          nba_criteria_id: cycleCategory.id,
          nba_criteria_sub_level1_id: cycleSubCategory?.id || cycleCategory.id,
          academic_year: "2024-2025",
          program_name: "Program",
          cycleName: "Cycle",
          reportType: "SAR Report",
          taskData: task,
          fromContributorDashboard: true
        };
      } else if (isSubCoordinator) {
        // SUB-COORDINATOR FLOW: Navigate to full criteria page with coordinator permissions
        navigationState = {
          nba_accredited_program_id: cycleId,
          nba_criteria_id: cycleCategory.id,
          nba_criteria_sub_level1_id: cycleCategory.id, // Use category ID for full access
          academic_year: "2024-2025",
          program_name: "Program",
          cycleName: "Cycle",
          reportType: "SAR Report",
          programId: null,
          taskData: task,
          fromSubCoordinatorDashboard: true,
          isSubCoordinatorAccess: true,
          allocatedCategoryId: cycleCategory.id
        };
      } else {
        // Default fallback
        navigationState = {
          nba_accredited_program_id: cycleId,
          nba_criteria_id: cycleCategory.id,
          nba_criteria_sub_level1_id: cycleSubCategory?.id || cycleCategory.id,
          academic_year: "2024-2025",
          program_name: "Program",
          cycleName: "Cycle",
          reportType: "SAR Report",
          taskData: task
        };
      }

      // DEBUG: Check what category name is being extracted
      console.log("🔍 DASHBOARD NAVIGATION DEBUG:");
      console.log("User type - isContributor:", isContributor, "isSubCoordinator:", isSubCoordinator);
      console.log("Extracted category name:", categoryName);
      console.log("Determined criteria route:", criteriaRoute);
      console.log("Full task object:", task);
      console.log("Navigation state being passed:", navigationState);

      // Validate that we have all required IDs
      if (!navigationState.nba_accredited_program_id || !navigationState.nba_criteria_id || !navigationState.nba_criteria_sub_level1_id) {
        showAlert("error", "Navigation Error", "Missing required navigation parameters. Please check the task data.");
        return;
      }

      // Navigate to the appropriate criteria component
      navigate(criteriaRoute, { state: navigationState });

    } catch (error) {
      console.error("Error navigating to criteria:", error);
      showAlert("error", "Navigation Error", "Unable to navigate to criteria. Please try again.");
    }
  };

  const {
    nbacoardinator,
    categories,
    subCategories,
    institutes,
    programs,
    cycles,
    academicYears,
    reportTypes,
    loadingCategories,
    loadingSubCategories,
    loadingPrograms,
    programFetchError,
    selectedCategory,
    selectedInstitute,
    selectedProgram,
    selectedAcademicYear,
    selectedReportType,
    alert,
    // Admin profile extracted flags for use across pages
    adminProfile,
    isCoordinator,
    isSubCoordinator,
    isContributor,
    staffAccess,
    // Contributor tasks
    contributorTasks,
    loadingContributorTasks,
    contributorTasksError,
    // Sub-coordinator tasks
    subCoordinatorTasks,
    loadingSubCoordinatorTasks,
    subCoordinatorTasksError,
  } = state;

  const canCreateReport = nbacoardinator || isSuperAdmin;

  return (
    <>
      {alert}

      <div className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-[#2162c1]">
            NBA Accreditation Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Create and manage accreditation reports efficiently</p>
        </div>

        {/* Create Report Form */}
        {canCreateReport && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="w-full px-6 py-5 flex items-center justify-between bg-[#2162c1] text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold">Create New Accreditation Report</h2>
                  <p className="text-sm opacity-90">Click to {isFormOpen ? "hide" : "show"} form</p>
                </div>
              </div>
              <svg className={`w-6 h-6 transition-transform duration-300 ${isFormOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`transition-all duration-500 ease-in-out ${isFormOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
              <div className="bg-white rounded-2xl shadow-lg border p-8 mb-10 m-3 overflow-visible">
                <Formik
                  enableReinitialize
                  initialValues={{
                    category: selectedCategory,
                    subCategory: "",
                    institute: selectedInstitute,
                    program: selectedProgram,
                    academic_year: selectedAcademicYear,
                    report_type: selectedReportType,
                    cycle: "",
                  }}
                  validationSchema={Yup.object({
                    category: Yup.string().required("Category is required"),
                    institute: Yup.string().required("Institute is required"),
                    // program: Yup.string().required("Program is required"),
                    academic_year: Yup.string().required("Academic Year is required"),
                    report_type: Yup.string().required("Report Type is required"),
                    // cycle: Yup.string().required("Cycle is required"),
                  })}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      // Map to exact backend payload
                      const payload = {
                        college_id: parseInt(values.institute),
                        program_id: parseInt(values.program),
                        academic_year_id: parseInt(values.academic_year),
                        report_type_category_id: parseInt(values.report_type),
                        cycle_name: values.cycle,
                        other_staff_id: state.currentUserId,
                      };

                      console.log("Sending payload:", payload); // Debug

                      const result = await nbaDashboardService.saveAccrediatedProgram(payload);

                      if (result?.status === 400) {
                        showAlert("warning", "Already Exists", "Report already exists for this combination.");
                      } else {
                        showAlert("success", "Success!", "Report created successfully!");
                        setIsFormOpen(false);
                        // setTimeout(() => window.location.reload(), 1500);
                      }
                    } catch (err) {
                      showAlert("error", "Failed", err.message || "Could not create report.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ values, handleChange, setFieldValue, isSubmitting }) => (
                    <Form>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
                          {/* Category */}
                          {loadingCategories ? (
                            <div className="flex items-center gap-4">
                              <Building2 className="w-8 h-8 text-green-600" />
                              <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                                <div className="px-4 py-2.5 bg-gray-100 rounded-lg text-sm">Loading categories...</div>
                              </div>
                            </div>
                          ) : (
                            <CustomSelectWithIcon
                              icon={Building2}
                              iconColor="text-green-600"
                              label="Category"
                              value={values.category}
                              onChange={(e) => {
                                const catId = e.target.value;
                                handleChange(e);
                                setFieldValue("subCategory", "");
                                setFieldValue("program", "");
                                updateState({ selectedCategory: catId });
                                fetchSubCategories(catId);
                                fetchPrograms(catId);
                              }}
                              options={categories}
                              placeholder="Select Category"
                              required={true}
                            />
                          )}

                          {/* Sub-Category */}
                          {loadingSubCategories ? (
                            <div className="flex items-center gap-4">
                              <Building2 className="w-8 h-8 text-yellow-600" />
                              <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Category</label>
                                <div className="px-4 py-2.5 bg-gray-100 rounded-lg text-sm">Loading...</div>
                              </div>
                            </div>
                          ) : subCategories.length > 0 ? (
                            <CustomSelectWithIcon
                              icon={Building2}
                              iconColor="text-yellow-600"
                              label="Sub-Category"
                              placeholder="Select Sub-Category"
                              value={values.subCategory}
                              onChange={(e) => {
                                const subCatId = e.target.value;
                                setFieldValue("subCategory", subCatId);
                                setFieldValue("program", "");
                              }}
                              options={subCategories}
                            />
                          ) : (
                            <div className="flex items-center gap-4">
                              <Building2 className="w-8 h-8 text-yellow-600" />
                              <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Category</label>
                                <div className="px-4 py-2.5 bg-gray-100 rounded-lg text-gray-500 text-sm">
                                  {values.category ? "No sub-categories" : "Select category first"}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Institute */}
                          {institutes.length === 1 ? (
                            <div className="flex items-center gap-4">
                              <GraduationCap className="w-8 h-8 text-[#2162c1]" />
                              <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Institute <span className="text-red-500">*</span></label>
                                <div className="px-4 py-2.5 bg-[#2162c1] border border-[#2162c1] rounded-lg text-white font-medium text-sm">
                                  {institutes[0].name}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <CustomSelectWithIcon
                              icon={GraduationCap}
                              iconColor="text-[#2162c1]"
                              label="Institute"
                              name="institute"
                              value={values.institute}
                              onChange={handleChange}
                              options={institutes}
                              placeholder="Select Institute"
                              required={true}
                            />
                          )}

                          {/* Program */}
                          <CustomSelectWithIcon
                            icon={BookOpen}
                            iconColor="text-blue-600"
                            label="Program"
                            name="program"
                            value={values.program}
                            onChange={handleChange}
                            options={programs}
                            placeholder="Select Program"
                            required={true}
                          />
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                          {/* Cycle */}
                          <CustomSelectWithIcon
                            icon={Calendar}
                            iconColor="text-red-600"
                            label="Cycle"
                            name="cycle"
                            value={values.cycle}
                            onChange={handleChange}
                            options={cycles.map(c => ({ id: c.name, name: c.name }))}
                            placeholder="Select Cycle"
                            required={true}
                          />

                          {/* Academic Year */}
                          <CustomSelectWithIcon
                            icon={BookOpen}
                            iconColor="text-orange-600"
                            label="Academic Year"
                            name="academic_year"
                            value={values.academic_year}
                            onChange={handleChange}
                            options={academicYears}
                            placeholder="Select Year"
                            required={true}
                          />

                          {/* Report Type */}
                          <CustomSelectWithIcon
                            icon={FileText}
                            iconColor="text-purple-600"
                            label="Report Type"
                            name="report_type"
                            value={values.report_type}
                            onChange={handleChange}
                            options={reportTypes}
                            placeholder="Select Type"
                            required={true}
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="xl:col-span-4 flex justify-center items-end mt-6">
                        <button
                          type="submit"
                          disabled={isSubmitting || loadingPrograms || !!programFetchError}
                          className="px-12 py-3 bg-[#2162c1] hover:bg-[#1a4f9a] text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Creating..." : "Create Report"}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )}

        {/* Contributor Dashboard Section */}
        {isContributor && (
          <ContributorDashboard
            nbaAccreditedProgramId={selectedProgram}
            academicYear={selectedAcademicYear}
            programName={programs.find(p => p.id === selectedProgram)?.name || "Program"}
          />
        )}

        {/* Sub-Coordinator Tasks Section */}
        {isSubCoordinator && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-600 text-white p-6">
              <h2 className="text-2xl font-bold">My Sub-Coordinator Tasks</h2>
              <p className="opacity-90 mt-1">Tasks assigned to you as a sub-coordinator</p>
            </div>
            <div className="p-6">
              {loadingSubCoordinatorTasks ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading sub-coordinator tasks...</div>
                </div>
              ) : subCoordinatorTasksError ? (
                <div className="text-red-500 text-center py-8">
                  {subCoordinatorTasksError}
                </div>
              ) : subCoordinatorTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subCoordinatorTasks.map((task, index) => (
                    <div
                      key={task.allocation_id || index}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:border-orange-300 hover:shadow-md transition-all duration-200 h-fit cursor-pointer"
                      onClick={() => handleTaskCardClick(task)}
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base mb-3 line-clamp-2 hover:text-orange-600 transition-colors">
                            {task.cycle_category?.category_name || 'Task Name Not Available'}
                          </h3>

                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-600">Assigned by:</span>
                              <div className="text-sm text-gray-800 mt-1">
                                {task.assigned_by ?
                                  `${task.assigned_by.firstname || ''} ${task.assigned_by.lastname || ''}`.trim() || 'Unknown'
                                  : 'Unknown'}
                              </div>
                            </div>

                            {task.remarks && (
                              <div>
                                <span className="text-xs font-medium text-gray-600">Remarks:</span>
                                <div className="text-sm text-gray-800 mt-1 line-clamp-2">{task.remarks}</div>
                              </div>
                            )}

                            <div>
                              <span className="text-xs font-medium text-gray-600">Created:</span>
                              <div className="text-sm text-gray-800 mt-1">
                                {task.createddate ? new Date(task.createddate).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          {task.cycle_sub_category?.score !== null && task.cycle_sub_category?.score !== undefined && (
                            <div className="text-xs text-gray-500 font-medium">
                              Score: {task.cycle_sub_category.score}
                            </div>
                          )}
                        </div>

                        {/* Click indicator */}
                        <div className="text-xs text-orange-500 text-center opacity-70 hover:opacity-100 transition-opacity">
                          Click to open criteria →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sub-coordinator tasks assigned yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* List */}
        {canCreateReport && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#2163c1] text-white p-6">
              <h2 className="text-2xl font-bold">Your Accredited Programs</h2>
              <p className="opacity-90 mt-1">View and manage all NBA reports</p>
            </div>
            <div className="p-6">
              <ListNBAAccredatedOptimized collegeId={JSON.parse(localStorage.getItem('activeCollege') || '{}')?.id} programId={selectedProgram} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewNBADashboard;