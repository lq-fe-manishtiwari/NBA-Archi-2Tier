// src/screens/pages/NEWNBA/Criteria1/NBACriteria1Optimized.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Modal from "react-modal";
import SweetAlert from "react-bootstrap-sweetalert";
import { ChevronDown } from "lucide-react";

import CriterionForm8 from "../Components/Criteria8/CriterionForm8";
import AllocateUsersModal from "../Components/AllocateUsersModal";
import CriteriaLoader from "../Components/CriteriaLoader";
import GenericCardWorkflow from "../Components/GenericCardWorkflow";

import { nbaDashboardService } from "../Services/NBA-dashboard.service";
import { nbaAllocationService } from "../Services/NBA-Allocation.service";
import { allocateUsersModalService } from "../Services/AllocateUsersModal.service";
import { nbaOptimizedAPIService } from "../Services/NBA-OptimizedAPI.service";
import { newnbaCriteria8Service } from "../Services/NewNBA-Criteria8.service";
import { newnbaCriteria1Service } from "../Services/NewNBA-Criteria1.service";
import { ReportService } from "../Services/Report.Service";
import { toast } from "react-toastify";
// import Swal from "sweetalert2";

const NBACriteria8Optimized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateFromRoute = location.state || {};

  const nbaAccreditedProgramId = stateFromRoute.nba_accredited_program_id;
  const nbaCriteriaId = stateFromRoute.nba_criteria_id;
  const nbaCriteriaSubLevel1Id = stateFromRoute.nba_criteria_sub_level1_id;
  const academicYear = stateFromRoute.academic_year || stateFromRoute.selectedEntry?.academicYear;
  const programName = stateFromRoute.program_name || "Program";
  const cycleName = stateFromRoute?.cycleName;
  const breadcrumbforCo_SCO = location?.state?.taskData?.cycleName;
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [keyIndicators, setKeyIndicators] = useState([]);
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [allocatedUsers, setAllocatedUsers] = useState({});
  const [completedStatus, setCompletedStatus] = useState({});
  const [dataFilledStatus, setDataFilledStatus] = useState({});
  const [isContributor, setIsContributor] = useState(false);
  const [isSubCoordinator, setIsSubCoordinator] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState({});
  const [alert, setAlert] = useState(null);

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // New state for card-based workflow
  const [cardData, setCardData] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [sectionMarks, setSectionMarks] = useState({});
  const getTotalMarks = (sectionCode) => {
    const marks = {
      '8.1': 40,
      '8.2': 10,
      '8.3': 5,
      '8.4': 5,
      '8.5': 10,
      '8.6': 5,
      '8.7': 10,
    };
    return marks[sectionCode] || 0;
  };
  const [refreshMoSectionId, setRefreshMoSectionId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const s3DocumentUrl =
    "https://wccdm.s3.ap-south-1.amazonaws.com/nba/1765294337-merged_8.png";

  // Dynamic card configuration based on section type
  const getCardConfig = (sectionName) => {
    if (!sectionName) return {};

    if (sectionName.includes("8.1")) {
      return {
        title: "Continuous Improvement Entry",
        statusField: "approval_status",
        userField: "other_staff_id",
        nameFields: ["firstname", "lastname"],
        idField: "co_po_pso_actions_id",
        isCoordinatorField: "is_coordinator_entry",
        dateField: "created_at"
      };
    } else if (sectionName.includes("8.2")) {
      return {
        title: "Quality Assurance Entry",
        statusField: "approval_status",
        userField: "other_staff_id",
        nameFields: ["firstname", "lastname"],
        idField: "academic_audit_id",
        isCoordinatorField: "is_coordinator_entry",
        dateField: "created_at"
      };
    } else if (sectionName.includes("8.3")) {
      return {
        title: "Faculty Feedback Entry",
        statusField: "approval_status",
        userField: "faculty_id",
        nameFields: ["firstname", "lastname"],
        idField: "faculty_qualification_improvement_id",
        isCoordinatorField: "is_coordinator_entry",
        dateField: "created_at"
      };
    } else if (sectionName.includes("8.4")) {
      return {
        title: "Student Feedback Entry",
        statusField: "approval_status",
        userField: "student_id",
        nameFields: ["firstname", "lastname"],
        idField: "academic_performance_improvement_id",
        isCoordinatorField: "is_coordinator_entry",
        dateField: "created_at"
      };
    } else if (sectionName.includes("8.5")) {
      return {
        title: "Career Guidance Entry",
        statusField: "approval_status",
        userField: "other_staff_id",
        nameFields: ["firstname", "lastname"],
        idField: "career_guidance_id",
        isCoordinatorField: "is_coordinator_entry",
        dateField: "created_at"
      };
    } else if (sectionName.includes("8.6")) {
      return {
        title: "Entrepreneurship Entry",
        statusField: "approval_status",
        userField: "other_staff_id",
        nameFields: ["firstname", "lastname"],
        idField: "entrepreneurship_id",
        isCoordinatorField: "is_coordinator_entry",
        dateField: "created_at"
      };
    } else if (sectionName.includes("8.7")) {
      return {
        title: "Activities Entry",
        statusField: "approval_status",
        userField: "other_staff_id",
        nameFields: ["firstname", "lastname"],
        idField: "activities_id",
        isCoordinatorField: "is_coordinator_entry",
        dateField: "created_at"
      };
    } else {
      return {};
    }
  };


  // Dynamic API service based on section type
  const getApiService = (sectionName) => {
    if (!sectionName) return {};

    if (sectionName.includes("8.1")) {
      return {
        updateCardStatus: newnbaCriteria8Service.updateStudentSupportApprovalStatus,
        getCardData: newnbaCriteria8Service.getAllStudentSupportContributors,
        getSectionData: newnbaCriteria8Service.getStudentSupportSystemByStaff
      };
    } else if (sectionName.includes("8.2")) {
      return {
        updateCardStatus: newnbaCriteria8Service.updateStudentSupportApprovalStatus,
        getCardData: newnbaCriteria8Service.getAllStudentSupportContributors,
        getSectionData: newnbaCriteria8Service.getStudentSupportSystemByStaff
      };
    } else if (sectionName.includes("8.3")) {
      return {
        updateCardStatus: newnbaCriteria8Service.updateStudentSupportApprovalStatus,
        getCardData: newnbaCriteria8Service.getAllStudentSupportContributors,
        getSectionData: newnbaCriteria8Service.getStudentSupportSystemByStaff
      };
    } else if (sectionName.includes("8.4")) {
      return {
         updateCardStatus: newnbaCriteria8Service.updateStudentSupportApprovalStatus,
        getCardData: newnbaCriteria8Service.getAllStudentSupportContributors,
        getSectionData: newnbaCriteria8Service.getStudentSupportSystemByStaff
      };
    } else if (sectionName.includes("8.5")) {
      return {
        updateCardStatus: newnbaCriteria8Service.updateStudentSupportApprovalStatus,
        getCardData: newnbaCriteria8Service.getAllStudentSupportContributors,
        getSectionData: newnbaCriteria8Service.getStudentSupportSystemByStaff
      };
    } else if (sectionName.includes("8.6")) {
      return {
         updateCardStatus: newnbaCriteria8Service.updateStudentSupportApprovalStatus,
        getCardData: newnbaCriteria8Service.getAllStudentSupportContributors,
        getSectionData: newnbaCriteria8Service.getStudentSupportSystemByStaff
      };
    } else if (sectionName.includes("8.7")) {
      return {
         updateCardStatus: newnbaCriteria8Service.updateStudentSupportApprovalStatus,
        getCardData: newnbaCriteria8Service.getAllStudentSupportContributors,
        getSectionData: newnbaCriteria8Service.getStudentSupportSystemByStaff
      };
    } else {
      return {};
    }
  };


  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    if (!nbaAccreditedProgramId || !nbaCriteriaId || !nbaCriteriaSubLevel1Id) {
      navigate("/nba/view-part-b");
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setCurrentUserInfo(userInfo);

    // Check if user is contributor from multiple sources
    const isUserContributor = !!(
      userInfo.nba_contributor ||
      stateFromRoute.fromContributorDashboard ||
      (stateFromRoute.taskData && stateFromRoute.taskData.contributor_id)
    );

    const isUserSubCoordinator = !!(
      userInfo.nba_sub_coordinator ||
      stateFromRoute.fromSubCoordinatorDashboard ||
      stateFromRoute.isSubCoordinatorAccess
    );

    setIsContributor(isUserContributor);
    setIsSubCoordinator(isUserSubCoordinator);

    loadOptimizedData(isUserContributor, isUserSubCoordinator);
  }, [nbaAccreditedProgramId, nbaCriteriaId, nbaCriteriaSubLevel1Id, navigate]);

  useEffect(() => {
    if (expandedSectionId && keyIndicators.length > 0 && !isContributor) {
      const indicator = keyIndicators.find(ind => ind.subLevel2Id === expandedSectionId);
      if (indicator) {
        fetchCardDetails(expandedSectionId, indicator.rawName);
      }
    }
  }, [expandedSectionId, refreshTrigger]);

  const loadOptimizedData = async (contributorFlag = isContributor, subCoordinatorFlag = isSubCoordinator) => {
    try {
      setProgress(20);
      if (contributorFlag && !subCoordinatorFlag) {
        await fetchContributorAllocations();
      } else {
        await fetchCoordinatorCriteria();
      }
      setProgress(100);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      console.error("Load failed:", err);
      setLoading(false);
    }
  };

  const fetchCoordinatorCriteria = async () => {
    try {
      const res = await nbaDashboardService.getSubCriteriasbycycleCriteriaId(
        nbaAccreditedProgramId,
        nbaCriteriaId
      );

      if (!Array.isArray(res) || res.length === 0) {
        setKeyIndicators([]);
        return;
      }

      const indicators = res.map((item) => ({
        id: item.cycleSubCategoryId,
        subLevel2Id: item.cycleSubCategoryId,
        rawName: item.subCategoryName || "Unnamed Section",
      }));

      setKeyIndicators(indicators);

      // Initialize section marks with TM values
      const initialSectionMarks = {};
      indicators.forEach(ind => {
        const sectionMatch = ind.rawName.match(/^(\d+\.\d+)/);
        const sectionCode = sectionMatch ? sectionMatch[1] : null;
        if (sectionCode) {
          const tm = getTotalMarks(sectionCode);
          initialSectionMarks[ind.subLevel2Id] = { tm };
        }
      });
      setSectionMarks(initialSectionMarks);

      await fetchAllIndicatorData(indicators);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchContributorAllocations = async () => {
    try {
      if (nbaCriteriaSubLevel1Id && stateFromRoute.fromContributorDashboard && stateFromRoute.taskData) {
        const taskData = stateFromRoute.taskData;

        const filtered = [{
          id: taskData.cycle_sub_category.id,
          subLevel2Id: taskData.cycle_sub_category.id,
          rawName: taskData.cycle_sub_category.sub_category?.name || taskData.cycle_sub_category.sub_category_name || "Section",
        }];

        setKeyIndicators(filtered);

        // Initialize section marks with TM values
        const initialSectionMarks = {};
        filtered.forEach(ind => {
          const sectionMatch = ind.rawName.match(/^(\d+\.\d+)/);
          const sectionCode = sectionMatch ? sectionMatch[1] : null;
          if (sectionCode) {
            const tm = getTotalMarks(sectionCode);
            initialSectionMarks[ind.subLevel2Id] = { tm };
          }
        });
        setSectionMarks(initialSectionMarks);

        if (filtered.length > 0) {
          await fetchAllIndicatorData(filtered);
        }
        return;
      }

      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const staffId = userInfo.other_staff_id || userInfo2.rawData?.other_staff_id;

      if (!staffId) {
        setKeyIndicators([]);
        return;
      }

      const res = await allocateUsersModalService.getAllocateSectionForContributor(staffId);
      const allocations = Array.isArray(res) ? res : [];

      const filtered = allocations
        .filter((alloc) => {
          const programId = alloc.cycle_sub_category?.cycle_category?.cycle?.program?.program_id;
          return String(programId) === String(nbaAccreditedProgramId);
        })
        .map((alloc) => {
          const subCat = alloc.cycle_sub_category;
          return {
            id: subCat.id,
            subLevel2Id: subCat.id,
            rawName: alloc.sub_category?.name || "Section",
          };
        });

      setKeyIndicators(filtered);

      // Initialize section marks with TM values
      const initialSectionMarks = {};
      filtered.forEach(ind => {
        const sectionMatch = ind.rawName.match(/^(\d+\.\d+)/);
        const sectionCode = sectionMatch ? sectionMatch[1] : null;
        if (sectionCode) {
          const tm = getTotalMarks(sectionCode);
          initialSectionMarks[ind.subLevel2Id] = { tm };
        }
      });
      setSectionMarks(initialSectionMarks);

      if (filtered.length > 0) await fetchAllIndicatorData(filtered);
    } catch (e) {
      console.error("Error fetching contributor allocations:", e);
    }
  };

  const fetchAllIndicatorData = async (indicators) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const isContrib = !!userInfo.nba_contributor;
    const currentStaffId = userInfo?.rawData?.other_staff_id || userInfo.user_id;

    if (stateFromRoute.fromContributorDashboard && stateFromRoute.taskData) {
      const taskData = stateFromRoute.taskData;
      const usersMap = {};
      const statusMap = {};
      const filledMap = {};

      const subLevel2Id = taskData.cycle_sub_category.id;
      usersMap[subLevel2Id] = [{
        school_user: {
          firstname: taskData.contributor?.firstname || "User",
          lastname: taskData.contributor?.lastname || "",
          school_user_id: taskData.contributor_id,
        },
        nba_contributor_allocation_id: taskData.id,
        completed: taskData.status === "COMPLETED",
      }];
      statusMap[subLevel2Id] = taskData.status === "COMPLETED";
      filledMap[subLevel2Id] = true;

      setAllocatedUsers(usersMap);
      setCompletedStatus(statusMap);
      setDataFilledStatus(filledMap);

      // Initialize section marks with TM values
      const sectionMatch = taskData.cycle_sub_category.sub_category?.name?.match(/^(\d+\.\d+)/) || taskData.cycle_sub_category.sub_category_name?.match(/^(\d+\.\d+)/);
      const sectionCode = sectionMatch ? sectionMatch[1] : null;
      const tm = sectionCode ? getTotalMarks(sectionCode) : 0;
      setSectionMarks({ [subLevel2Id]: { tm } });

      return;
    }

    if (!currentStaffId) {
      setAllocatedUsers({});
      setCompletedStatus({});
      setDataFilledStatus({});
      return;
    }

    const usersMap = {};
    const statusMap = {};
    const filledMap = {};

    for (const ind of indicators) {
      const subLevel2Id = ind.subLevel2Id;
      let users = [];
      let completed = false;
      let hasData = false;

      try {
        if (isContrib) {
          const res = await allocateUsersModalService.getAllocateSectionForContributor(currentStaffId);
          const match = res.find(a => Number(a.cycle_sub_category?.id) === Number(subLevel2Id));

          if (match && match.contributor) {
            const c = match.contributor;
            users = [{
              school_user: {
                firstname: c.firstname || "User",
                lastname: c.lastname || "",
                school_user_id: c.other_staff_id,
              },
              nba_contributor_allocation_id: match.allocation_id,
              completed: match.status === "COMPLETED",
            }];
            completed = match.status === "COMPLETED";
            hasData = match.has_data === true || match.status === "SUBMITTED";
          }
        } else {
          const res = await allocateUsersModalService.getAllocateUsers(subLevel2Id);
          const list = Array.isArray(res) ? res : [];

          const contributorList = list.filter(item =>
            item.contributor &&
            item.contributor.other_staff_id &&
            !item.isSubCoordinator
          );

          users = contributorList.map((item) => ({
            school_user: {
              firstname: item.contributor?.firstname || "User",
              lastname: item.contributor?.lastname || "",
              school_user_id: item.contributor?.other_staff_id,
            },
            nba_contributor_allocation_id: item.allocation_id,
            completed: item.status === "COMPLETED",
            isContributor: true,
          }));

          hasData = contributorList.some(item => item.has_data || item.status === "SUBMITTED");
          completed = users.some(u => u.completed);
        }
      } catch (err) {
        console.error(`Error fetching data for section ${subLevel2Id}:`, err);
      }

      usersMap[subLevel2Id] = users;
      statusMap[subLevel2Id] = completed;
      filledMap[subLevel2Id] = hasData;
    }

    setAllocatedUsers(usersMap);
    setCompletedStatus(statusMap);
    setDataFilledStatus(filledMap);
  };

  const toggleSection = async (id) => {
    console.log("🔄 CRITERIA 8: toggleSection called with id:", id);

    const wasExpanded = expandedSectionId === id;
    setExpandedSectionId(prev => (prev === id ? null : id));

    if (!wasExpanded && id) {
      const indicator = keyIndicators.find(ind => ind.subLevel2Id === id);
      if (indicator) {
        console.log("✅ CRITERIA 8: Fetching card details for section:", indicator.rawName);
        await fetchCardDetails(id, indicator.rawName);
      }
    }
  };

  const fetchCardDetails = async (cycleSubCategoryId, sectionName = "8.1") => {
    try {
      console.log("📡 CRITERIA 8: Fetching card details for:", cycleSubCategoryId, sectionName);

      // Use dynamic API service
      const apiService = getApiService(sectionName);

      // Contributor cards
      let cardDetails = [];
      try {
        const response = await apiService.getCardData(cycleSubCategoryId);
        console.log("📊 RAW API Response:", response);

        if (Array.isArray(response)) {
          cardDetails = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          cardDetails = response.data;
        } else if (response && typeof response === 'object') {
          cardDetails = [response];
        } else {
          cardDetails = [];
        }

        // Dynamic ID mapping based on section
        cardDetails = cardDetails.map(card => {
          let primaryId = null;

          // Map the correct ID field based on section
          if (sectionName.includes("8.1")) {
            primaryId = card.co_po_pso_actions_id || card.id || null;
          } else if (sectionName.includes("8.2")) {
            primaryId = card.academic_audit_id || card.id || null;
          } else if (sectionName.includes("8.3")) {
            primaryId = card.faculty_qualification_improvement_id || card.id || null;
          } else if (sectionName.includes("8.4")) {
            primaryId = card.academic_performance_improvement_id || card.id || null;
          } else if (sectionName.includes("8.5")) {
            primaryId = card.career_guidance_id || card.id || null;
          } else if (sectionName.includes("8.6")) {
            primaryId = card.entrepreneurship_id || card.id || null;
          } else if (sectionName.includes("8.7")) {
            primaryId = card.activities_id || card.id || null;
          } else {
            primaryId = card.id || null;
          }

          return {
            // Dynamic ID fields for different sections
            co_po_pso_actions_id: sectionName.includes("8.1") ? primaryId : null,
            academic_audit_id: sectionName.includes("8.2") ? primaryId : null,
            faculty_qualification_improvement_id: sectionName.includes("8.3") ? primaryId : null,
            academic_performance_improvement_id: sectionName.includes("8.4") ? primaryId : null,
            career_guidance_id: sectionName.includes("8.5") ? primaryId : null,
            entrepreneurship_id: sectionName.includes("8.6") ? primaryId : null,
            activities_id: sectionName.includes("8.7") ? primaryId : null,

            // Common fields
            other_staff_id: card.other_staff_id || card.staff_id || card.user_id || null,
            firstname: card.firstname || card.staff_firstname || card.first_name || 'Contributor',
            lastname: card.lastname || card.staff_lastname || card.last_name || '',
            middlename: card.middlename || '',

            // Section-specific content fields
            co_actions_details: card.co_actions_details || '',
            po_pso_actions_details: card.po_pso_actions_details || '',
            audit_details: card.audit_details || '',
            feedback_details: card.feedback_details || '',
            self_learning_details: card.self_learning_details || '',
            career_guidance_details: card.career_guidance_details || '',
            entrepreneurship_details: card.entrepreneurship_details || '',
            activities_details: card.activities_details || '',

            // Document fields
            co_supporting_documents: card.co_supporting_documents || [],
            po_pso_supporting_documents: card.po_pso_supporting_documents || [],
            quality_assurance_documents: card.quality_assurance_documents || [],
            faculty_feedback_documents: card.faculty_feedback_documents || [],
            student_feedback_documents: card.student_feedback_documents || [],

            // Status and metadata
            approval_status: card.approval_status || 'PENDING',
            rejection_reason: card.rejection_reason || null,
            approved_by_name: card.approved_by_name || null,
            created_at: card.created_at || card.created_date || null,
            updated_at: card.updated_at || card.updated_date || null,
            cycle_sub_category_id: card.cycle_sub_category_id || cycleSubCategoryId,
            is_coordinator_entry: false,
            other_staff_name: card.other_staff_name || `${card.firstname || ''} ${card.lastname || ''}`.trim(),
            submitted_time: card.submitted_time || card.created_at || null,
            created_by_name: card.created_by_name || null,
            updated_by_name: card.updated_by_name || null
          };
        });
      } catch (error) {
        console.error("❌ Error fetching contributor cards:", error);
        toast.error("Failed to fetch contributor data");
      }

      // Coordinator's own data
      const currentUserInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const currentUserInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentStaffId = currentUserInfo?.rawData?.other_staff_id || currentUserInfo.user_id || currentUserInfo2?.other_staff_id || currentUserInfo2?.user_id;

      let allCards = [...cardDetails];

      if (currentStaffId) {
        try {
          const coordinatorResponse = await apiService.getSectionData(cycleSubCategoryId, currentStaffId);

          let coordinatorData;
          if (Array.isArray(coordinatorResponse)) coordinatorData = coordinatorResponse[0] || null;
          else coordinatorData = coordinatorResponse;

          // Check for coordinator data with dynamic ID field
          let hasCoordinatorData = false;
          let coordinatorId = null;

          if (sectionName.includes("8.1")) {
            hasCoordinatorData = !!coordinatorData?.co_po_pso_actions_id;
            coordinatorId = coordinatorData?.co_po_pso_actions_id;
          } else if (sectionName.includes("8.2")) {
            hasCoordinatorData = !!coordinatorData?.academic_audit_id;
            coordinatorId = coordinatorData?.academic_audit_id;
          } else if (sectionName.includes("8.3")) {
            hasCoordinatorData = !!coordinatorData?.faculty_qualification_improvement_id;
            coordinatorId = coordinatorData?.faculty_qualification_improvement_id;
          } else if (sectionName.includes("8.4")) {
            hasCoordinatorData = !!coordinatorData?.academic_performance_improvement_id;
            coordinatorId = coordinatorData?.academic_performance_improvement_id;
          } else if (sectionName.includes("8.5")) {
            hasCoordinatorData = !!coordinatorData?.career_guidance_id;
            coordinatorId = coordinatorData?.career_guidance_id;
          } else if (sectionName.includes("8.6")) {
            hasCoordinatorData = !!coordinatorData?.entrepreneurship_id;
            coordinatorId = coordinatorData?.entrepreneurship_id;
          } else if (sectionName.includes("8.7")) {
            hasCoordinatorData = !!coordinatorData?.activities_id;
            coordinatorId = coordinatorData?.activities_id;
          }

          if (hasCoordinatorData && coordinatorId) {
            const existingIndex = allCards.findIndex(card => card.other_staff_id === currentStaffId);
            if (existingIndex === -1) {
              const coordinatorCard = {
                ...coordinatorData,
                is_coordinator_entry: true,
                approval_status: 'COORDINATORS_DATA',
                firstname: coordinatorData.firstname || currentUserInfo?.rawData?.firstname || currentUserInfo2?.firstname || 'Coordinator',
                lastname: coordinatorData.lastname || currentUserInfo?.rawData?.lastname || currentUserInfo2?.lastname || '',
                other_staff_id: currentStaffId,
                // Set the correct ID field based on section
                co_po_pso_actions_id: sectionName.includes("8.1") ? coordinatorId : null,
                academic_audit_id: sectionName.includes("8.2") ? coordinatorId : null,
                faculty_qualification_improvement_id: sectionName.includes("8.3") ? coordinatorId : null,
                academic_performance_improvement_id: sectionName.includes("8.4") ? coordinatorId : null,
                career_guidance_id: sectionName.includes("8.5") ? coordinatorId : null,
                entrepreneurship_id: sectionName.includes("8.6") ? coordinatorId : null,
                activities_id: sectionName.includes("8.7") ? coordinatorId : null
              };
              allCards.unshift(coordinatorCard);
            } else {
              allCards[existingIndex] = {
                ...allCards[existingIndex],
                is_coordinator_entry: true,
                approval_status: 'COORDINATORS_DATA'
              };
            }
          }
        } catch (coordinatorError) {
          console.log("ℹ️ No coordinator data found:", coordinatorError.message);
        }
      }

      setCardData(prev => ({
        ...prev,
        [cycleSubCategoryId]: allCards
      }));

      // Also update dataFilledStatus if we have data
      if (allCards.length > 0) {
        setDataFilledStatus(prev => ({
          ...prev,
          [cycleSubCategoryId]: true
        }));
      }

      return allCards;
    } catch (error) {
      console.error("❌ CRITERIA 8: Failed to fetch card details:", error);
      toast.error("Failed to load cards");
      return [];
    }
  };
  // FIXED: handleCardClick function with proper parameter handling

  const handleCardClick = async (subLevel2Id, userStaffId, cardItem = null) => {
    try {
      console.log("🎯 CRITERIA 8: handleCardClick called with cardItem:", cardItem);

      const indicator = keyIndicators.find(ind => ind.subLevel2Id === subLevel2Id);
      const sectionName = indicator?.rawName || "";

      // Dynamic ID extraction based on section
      let primaryId = null;
      if (sectionName.includes("8.1")) {
        primaryId = cardItem?.id || null;
      } else if (sectionName.includes("8.2")) {
        primaryId = cardItem?.id || null;
      } else if (sectionName.includes("8.3")) {
        primaryId = cardItem?.id || null;
      } else if (sectionName.includes("8.4")) {
        primaryId = cardItem?.id || null;
      } else if (sectionName.includes("8.5")) {
        primaryId = cardItem?.id || null;
      } else if (sectionName.includes("8.6")) {
        primaryId = cardItem?.id || null;
      } else if (sectionName.includes("8.7")) {
        primaryId = cardItem?.id || null;
      }

      const selectedCardData = {
        cycleSubCategoryId: subLevel2Id,
        otherStaffId: cardItem?.other_staff_id || userStaffId,
        editMode: false,
        coPoPsoActionsId: sectionName.includes("8.1") ? primaryId : null,
        qualityAssuranceId: sectionName.includes("8.2") ? primaryId : null,
        facultyFeedbackId: sectionName.includes("8.3") ? primaryId : null,
        studentFeedbackId: sectionName.includes("8.4") ? primaryId : null,
        careerGuidanceId: sectionName.includes("8.5") ? primaryId : null,
        entrepreneurshipId: sectionName.includes("8.6") ? primaryId : null,
        activitiesId: sectionName.includes("8.7") ? primaryId : null,
        cardData: cardItem,
        sectionName: sectionName,
        isCoordinatorEntry: cardItem?.is_coordinator_entry || false,
        contributor_allocation_id: null
      };

      console.log("✅ CRITERIA 8: Setting selected card with data:", {
        staffId: selectedCardData.otherStaffId,
        section: sectionName,
        primaryId: primaryId,
        coPoPsoActionsId: selectedCardData.coPoPsoActionsId,
        qualityAssuranceId: selectedCardData.qualityAssuranceId,
        facultyFeedbackId: selectedCardData.facultyFeedbackId,
        studentFeedbackId: selectedCardData.studentFeedbackId,
        careerGuidanceId: selectedCardData.careerGuidanceId,
        entrepreneurshipId: selectedCardData.entrepreneurshipId,
        activitiesId: selectedCardData.activitiesId
      });

      setSelectedCard(selectedCardData);

      // Scroll to form
      setTimeout(() => {
        const formSection = document.querySelector('.selected-card-form');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (error) {
      console.error("❌ CRITERIA 8: Error in handleCardClick:", error);
      toast.error("Failed to load entry details");
    }

  };
  const handleStatusChange = async (cardItem, newStatus, subLevel2Id) => {
    try {
      console.log("🔄 CRITERIA 8: handleStatusChange called:", { cardItem, newStatus, subLevel2Id });

      const indicator = keyIndicators.find(ind => ind.subLevel2Id === subLevel2Id);
      const sectionName = indicator?.rawName || "";
      const cardConfig = getCardConfig(sectionName);

      const cardId = cardItem[cardConfig.idField];

      // Skip if this is coordinator's own data
      if (cardItem.is_coordinator_entry) {
        toast.info("Coordinator's own data cannot be approved/rejected");
        return;
      }

      const statusUpdateData = {
        status: newStatus,
        remarks: newStatus === 'REJECTED' ? 'Please review and resubmit' : 'Approved by coordinator'
      };

      console.log("📤 CRITERIA 8: Sending status update:", { cardId, statusUpdateData });

      // Use dynamic API service based on section
      let updateResult;

      if (sectionName.includes("8.1")) {
        updateResult = await newnbaCriteria8Service.updateStudentSupportApprovalStatus(cardId, statusUpdateData);
      } else if (sectionName.includes("8.2")) {
        updateResult = await newnbaCriteria8Service.updateStudentSupportApprovalStatus(cardId, statusUpdateData);
      } else if (sectionName.includes("8.3")) {
        updateResult = await newnbaCriteria8Service.updateStudentSupportApprovalStatus(cardId, statusUpdateData);
      } else if (sectionName.includes("8.4")) {
        updateResult = await newnbaCriteria8Service.updateStudentSupportApprovalStatus(cardId, statusUpdateData);
      } else if (sectionName.includes("8.5")) {
        updateResult = await newnbaCriteria8Service.updateStudentSupportApprovalStatus(cardId, statusUpdateData);
      } else if (sectionName.includes("8.6")) {
        updateResult = await newnbaCriteria8Service.updateStudentSupportApprovalStatus(cardId, statusUpdateData);
      } else if (sectionName.includes("8.7")) {
        updateResult = await newnbaCriteria8Service.updateStudentSupportApprovalStatus(cardId, statusUpdateData);
      } else {
        throw new Error(`Unknown section: ${sectionName}`);
      }

      console.log("📤 CRITERIA 8: Update result:", updateResult);

      if (updateResult.success || updateResult.message) {
        toast.success(`Status updated to ${newStatus}`);

        // Refresh card data
        await fetchCardDetails(subLevel2Id, sectionName);

        // Update approval status state
        setApprovalStatus(prev => ({
          ...prev,
          [cardId]: newStatus
        }));

        // Trigger refresh
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("❌ CRITERIA 8: Error in handleStatusChange:", error);
      toast.error("Failed to update status");
    }
  };

  const handleCardRefresh = async (subLevel2Id) => {
    const indicator = keyIndicators.find(ind => ind.subLevel2Id === subLevel2Id);
    if (indicator) {
      await fetchCardDetails(subLevel2Id, indicator.rawName);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const openAllocationModal = (indicator) => {
    setSelectedIndicator(indicator);
    setIsAllocateModalOpen(true);
  };

  const cleanDisplayName = (rawName) => {
    if (!rawName) return "Untitled Section";
    return rawName.trim().replace(/^8\.\d+\s*-?\s*/i, "").trim() || "Untitled Section";
  };

  const handleCloseForm = () => {
    setSelectedCard(null);
    if (expandedSectionId) {
      const indicator = keyIndicators.find(ind => ind.subLevel2Id === expandedSectionId);
      if (indicator) {
        fetchCardDetails(expandedSectionId, indicator.rawName);
      }
    }
  };

  const handleGenerateReport = async () => {
    try {
      // Collect all cycleSubCategoryId values from keyIndicators
      const cycleSubCategoryIds = keyIndicators.map(indicator => indicator.subLevel2Id);

      if (cycleSubCategoryIds.length === 0) {
        alert("No criteria sections available to generate report.");
        return;
      }

      console.log("🔍 Generating report for cycleSubCategoryIds:", cycleSubCategoryIds);

      // Call the report service with the collected IDs
      const response = await ReportService.getReportCri8(cycleSubCategoryIds);

      // Handle the blob response for file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Criterion8_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  const handleMoChange = (subLevel2Id, value) => {
    const mo = Number(value);
    const tm = sectionMarks[subLevel2Id]?.tm || 0;

    const ach = tm > 0 ? ((mo / tm) * 100).toFixed(2) : 0;

    setSectionMarks(prev => ({
      ...prev,
      [subLevel2Id]: {
        ...prev[subLevel2Id],
        mo,
        ach
      }
    }));
  };

  const fetchMoMarks = async (subLevel2Id) => {
    try {
      const res = await newnbaCriteria1Service.getMoMarks(subLevel2Id);

      if (!Array.isArray(res) || res.length === 0) return;

      const latest = res.reduce((prev, curr) =>
        curr.marks_id > prev.marks_id ? curr : prev
      );

      const mo =
        latest.marks_obtained !== null && latest.marks_obtained !== undefined
          ? Number(latest.marks_obtained)
          : undefined;

      const tm =
        latest.total_marks !== null && latest.total_marks !== undefined
          ? Number(latest.total_marks)
          : sectionMarks[subLevel2Id]?.tm || 0;

      const ach = tm > 0 && mo !== undefined
        ? ((mo / tm) * 100).toFixed(2)
        : 0;

      setSectionMarks(prev => ({
        ...prev,
        [subLevel2Id]: {
          ...prev[subLevel2Id],
          mo,
          tm,
          ach,
          hasExistingMo: true,
          marksId: latest.marks_id
        }
      }));
    } catch (error) {
      console.error("Error fetching MO marks:", error);
    }
  };

  useEffect(() => {
    if (!keyIndicators.length) return;

    keyIndicators.forEach(ind => {
      fetchMoMarks(ind.subLevel2Id);
    });
  }, [keyIndicators]);

  useEffect(() => {
    if (!refreshMoSectionId) return;

    fetchMoMarks(refreshMoSectionId);

    setRefreshMoSectionId(null);
  }, [refreshMoSectionId]);

  const handleMoBlur = async (subLevel2Id) => {
    try {
      const section = sectionMarks[subLevel2Id];

      const mo = Number(section?.mo || 0);
      const tm = Number(section?.tm || 0);

      const payload = {
        nba_cycle_sub_category_id: subLevel2Id,
        marks_obtained: mo,
        total_marks: tm
      };

      if (section?.marksId) {
        // 🔁 UPDATE using marks_id
        await newnbaCriteria1Service.putMoMarks(
          section.marksId,   // ✅ marks_id
          payload
        );
        setAlert(
          <SweetAlert
            success
            title={"Saved!"}
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Marks updated successfully.
          </SweetAlert>
        );
        // toast.success("Marks updated successfully");
      } else {
        // 💾 SAVE
        await newnbaCriteria1Service.saveMoMarks(payload);
        setAlert(
          <SweetAlert
            success
            title={"Saved!"}
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Marks saved successfully.
          </SweetAlert>
        );
        // toast.success("Marks saved successfully");
      }

      setRefreshMoSectionId(subLevel2Id);
    } catch (err) {
      console.error("MO Save Error:", err);
      toast.error("Failed to save marks");
    }
  };

  if (loading) {
    return <CriteriaLoader criterionNumber={8} progress={progress} />;
  }

  return (
    <>
      {alert}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#2163c1]">
                  Criterion 8: Student support Systems
                </h1>
                <nav className="flex items-center gap-2 text-sm text-gray-600 mt-3">

                  {
                    isContributor || isSubCoordinator ? (
                      <span>{breadcrumbforCo_SCO}</span>
                    ) : (
                      <>
                        <span>{programName}</span>
                        <span>›</span>
                        <span>{cycleName}</span>
                        <span>›</span>
                        <span>{academicYear}</span>
                      </>
                    )
                  }
                </nav>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center bg-[#2163c1] hover:bg-[#1a4f9a] text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
                >
                  CR-8. R
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
                >
                  ER
                </button>
                <Link
                  to="/nba/view-part-b"
                  state={stateFromRoute}
                  className="flex items-center gap-2 bg-[#2163c1] hover:bg-[#1a4f9a] text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
                >
                  Back
                </Link>
              </div>

            </div>
          </div>

          <div className="space-y-6">
            {keyIndicators.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <p className="text-lg text-gray-500">
                  {isContributor ? "You have no sections allocated yet." : "No sections available."}
                </p>
              </div>
            ) : (
              keyIndicators.map((indicator, index) => {
                const sectionNumber = index + 1;
                let sectionCode = `8.${sectionNumber}`;
                if (indicator.rawName) {
                  const match = indicator.rawName.match(/8\.(\d+)/);
                  if (match) {
                    sectionCode = `8.${match[1]}`;
                  }
                }

                const subLevel2Id = indicator.subLevel2Id;
                const users = allocatedUsers[subLevel2Id] || [];
                const hasAllocation = users.length > 0;
                const isCompleted = !!completedStatus[subLevel2Id];
                const hasDataFilled = !!dataFilledStatus[subLevel2Id];
                const isExpanded = expandedSectionId === subLevel2Id;
                const currentCards = cardData[subLevel2Id] || [];

                if (isContributor && !isSubCoordinator && !hasAllocation) return null;

                return (
                  <div
                    key={subLevel2Id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
                  >
                    <div
                      // onClick={() => toggleSection(subLevel2Id)}
                      className={`px-6 py-5 flex items-center justify-between cursor-pointer transition-all ${isExpanded ? "bg-indigo-50 border-b border-indigo-200" : "bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* <div className="flex-shrink-0">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${isCompleted ? "bg-green-500" : "bg-[#2163c1]"
                              }`}
                          >
                            {sectionNumber}
                          </div>
                        </div> */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {sectionCode}. {cleanDisplayName(indicator.rawName)}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            {isCompleted && (
                              <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                Completed
                              </span>
                            )}
                            {hasAllocation && !isContributor && (
                              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full">
                                Allocated to Contributor(s)
                              </span>
                            )}
                            {isExpanded && currentCards.length > 0 && !isContributor && (
                              <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                {currentCards.length} entries
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">MO:</label>
                              <input
                                type="number"
                                min="0"
                                max={sectionMarks[subLevel2Id]?.tm || 0}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                value={
                                  sectionMarks[subLevel2Id]?.mo !== undefined
                                    ? sectionMarks[subLevel2Id]?.mo
                                    : ''
                                }
                                onChange={(e) => handleMoChange(subLevel2Id, e.target.value)}
                                onBlur={() => handleMoBlur(subLevel2Id)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">TM:</label>
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm">{sectionMarks[subLevel2Id]?.tm || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">% ACH:</label>
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm">{sectionMarks[subLevel2Id]?.ach || 0}%</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* {hasAllocation && (
                          <div className="flex -space-x-2">
                            {users.slice(0, 5).map((u, i) => {
                              const f = (u.school_user.firstname?.[0] || "?").toUpperCase();
                              const l = (u.school_user.lastname?.[0] || "?").toUpperCase();
                              return (
                                <div
                                  key={i}
                                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-md"
                                  title={`${u.school_user.firstname} ${u.school_user.lastname}`}
                                >
                                  {f}{l}
                                </div>
                              );
                            })}
                          </div>
                        )} */}

                        {!isContributor && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAllocationModal(indicator);
                            }}
                            className="px-4 py-2 text-sm font-medium bg-[#2163c1] text-white rounded-lg hover:bg-[#1a4f9a] transition"
                          >
                            {hasAllocation ? "Manage Allocation" : "Allocate"}
                          </button>
                        )}

                        {/* <i className={`fa-solid fa-chevron-down text-lg text-gray-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} /> */}
                        <ChevronDown
                          size={22}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSection(subLevel2Id);
                          }}
                          className={`cursor-pointer text-gray-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                            }`}
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 py-8 bg-gray-50 border-t border-gray-200">
                        {isContributor ? (
                          // Contributor sees form
                          <CriterionForm8
                            section={sectionCode}
                            nba_accredited_program_id={nbaAccreditedProgramId}
                            academic_year={academicYear}
                            nba_criteria_sub_level2_id={subLevel2Id}
                            contributor_allocation_id={users[0]?.nba_contributor_allocation_id || null}
                            completed={isCompleted}
                            isContributorEditable={!isSubCoordinator}
                            isSubCoordinator={isSubCoordinator}
                            onSuccess={() => handleCardRefresh(subLevel2Id)}
                          />
                        ) : (
                          // Coordinator view
                          <div className="space-y-4">
                            {/* Card Workflow Section - ALWAYS SHOW WHEN CARDS EXIST */}
                            {currentCards.length > 0 ? (
                              <>
                                <div className="mb-6">
                                  <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                      Contributor Entries ({currentCards.length})
                                    </h3>
                                    <button
                                      onClick={() => handleCardRefresh(subLevel2Id)}
                                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                      <i className="fa-solid fa-sync-alt mr-2"></i>
                                      Refresh
                                    </button>
                                  </div>

                                  <GenericCardWorkflow
                                    key={`cards-${subLevel2Id}-${currentCards.length}`}
                                    cycleSubCategoryId={subLevel2Id}
                                    cardData={currentCards}
                                    onCardClick={handleCardClick}
                                    onStatusChange={handleStatusChange}
                                    apiService={getApiService(indicator.rawName)}
                                    cardConfig={getCardConfig(indicator.rawName)}
                                    isSubCoordinator={isSubCoordinator}
                                    onRefresh={() => handleCardRefresh(subLevel2Id)}
                                  />
                                </div>
                              </>
                            ) : hasAllocation ? (
                              // Allocated but no data yet
                              <div className="text-center py-12">
                                <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                  <i className="fa-solid fa-hourglass-half text-3xl text-gray-400"></i>
                                </div>
                                <p className="text-lg text-gray-600">
                                  No data has been filled by the allocated contributor(s) yet.
                                </p>
                                <p className="text-sm text-gray-500 mt-2">Waiting for submission...</p>
                              </div>
                            ) : (
                              // No contributor → Coordinator fills himself
                              <CriterionForm8
                                section={sectionCode}
                                nba_accredited_program_id={nbaAccreditedProgramId}
                                academic_year={academicYear}
                                nba_criteria_sub_level2_id={subLevel2Id}
                                contributor_allocation_id={null}
                                completed={isCompleted}
                                isContributorEditable={!isSubCoordinator}
                                isSubCoordinator={isSubCoordinator}
                                onSuccess={() => handleCardRefresh(subLevel2Id)}
                              />
                            )}

                            {/* Selected Card Form */}
                            {selectedCard && selectedCard.cycleSubCategoryId == subLevel2Id && (
                              <div className="mt-6 bg-white border border-gray-300 rounded-lg p-6 shadow-lg selected-card-form">
                                <div className="flex items-center justify-between mb-6">
                                  <div>
                                    {/* <h5 className="text-lg font-semibold text-gray-900">
          {selectedCard.isCoordinatorEntry ? '📋 Coordinator Entry' : '👤 Contributor Entry Review'}
        </h5> */}
                                    {/* <p className="text-sm text-gray-600 mt-1">
          {selectedCard.cardData?.firstname || 'User'} {selectedCard.cardData?.lastname || ''}
          {selectedCard.cardData?.approval_status && (
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              selectedCard.cardData.approval_status === 'APPROVED' 
                ? 'bg-green-100 text-green-800' 
                : selectedCard.cardData.approval_status === 'REJECTED'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {selectedCard.cardData.approval_status}
            </span>
          )}
        </p> */}
                                  </div>
                                  <button
                                    onClick={handleCloseForm}
                                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                                    title="Close"
                                  >
                                    <i className="fa-solid fa-times text-xl"></i>
                                  </button>
                                </div>
                                <CriterionForm8
                                  key={`form-${selectedCard.otherStaffId}-${selectedCard.coPoPsoActionsId || selectedCard.qualityAssuranceId || selectedCard.facultyFeedbackId || selectedCard.studentFeedbackId}`}
                                  section={sectionCode}
                                  nba_accredited_program_id={nbaAccreditedProgramId}
                                  academic_year={academicYear}
                                  nba_criteria_sub_level2_id={subLevel2Id}
                                  contributor_allocation_id={null}
                                  completed={isCompleted}
                                  isContributorEditable={false}
                                  otherStaffId={selectedCard.otherStaffId}
                                  editMode={false}
                                  coPoPsoActionsId={selectedCard.coPoPsoActionsId}
                                  qualityAssuranceId={selectedCard.qualityAssuranceId}
                                  facultyFeedbackId={selectedCard.facultyFeedbackId}
                                  studentFeedbackId={selectedCard.studentFeedbackId}
                                  careerGuidanceId={selectedCard.careerGuidanceId}
                                  entrepreneurshipId={selectedCard.entrepreneurshipId}
                                  activitiesId={selectedCard.activitiesId}
                                  isSubCoordinator={isSubCoordinator}
                                  onSuccess={handleCloseForm}
                                  readOnly={true}
                                  cardItem={selectedCard.cardData}
                                  preLoadedData={selectedCard.cardData}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-6xl h-[95vh] mx-auto outline-none border-0 relative"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-2 z-50"
          ariaHideApp={false}
        >
          {/* Fixed Close Button - Always Visible */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
            title="Close"
          >
            X
          </button>

          <div className="flex flex-col h-full">
            {/* Modal Header - Fixed */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-[#2163c1] to-[#1a4f9a] text-white rounded-t-xl">
              <div className="flex items-center gap-3 pr-12">

                <div>
                  <h2 className="text-xl font-bold">ER Guidelines</h2>
                  <p className="text-sm opacity-90">Evidence Requirements Documentation</p>
                </div>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="p-4">
                <div className="bg-white rounded-lg shadow-inner border border-gray-200 overflow-auto max-h-full">
                  <img
                    src={s3DocumentUrl}
                    alt="ER Guidelines Document"
                    className="w-full h-auto block"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="hidden h-96 flex-col items-center justify-center text-gray-500"
                  >
                    <i className="fa-solid fa-exclamation-triangle text-4xl mb-4"></i>
                    <p className="text-lg font-medium">Unable to load document</p>
                    <p className="text-sm">Please check your internet connection</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="fa-solid fa-info-circle"></i>
                <span>Scroll to view the complete document</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(s3DocumentUrl, '_blank')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <i className="fa-solid fa-external-link-alt"></i>
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {selectedIndicator && (
        <AllocateUsersModal
          isOpen={isAllocateModalOpen}
          onClose={() => {
            setIsAllocateModalOpen(false);
            setSelectedIndicator(null);
          }}
          criteriaId={selectedIndicator.subLevel2Id}
          academicYear={academicYear}
          programId={nbaAccreditedProgramId}
          currentAllocated={allocatedUsers[selectedIndicator.subLevel2Id] || []}
          onSuccess={() => {
            setIsAllocateModalOpen(false);
            setSelectedIndicator(null);
            fetchAllIndicatorData(keyIndicators);
            if (expandedSectionId) {
              handleCardRefresh(expandedSectionId);
            }
          }}
        />
      )}
    </>
  );
};

export default NBACriteria8Optimized;  