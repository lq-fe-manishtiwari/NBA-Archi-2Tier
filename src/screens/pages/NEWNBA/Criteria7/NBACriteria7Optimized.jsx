// src/screens/pages/NEWNBA/Criteria7/NBACriteria7Optimized.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import SweetAlert from "react-bootstrap-sweetalert";
import { ChevronDown } from "lucide-react";

import CriterionForm from "../Components/CriterionForm7";
import AllocateUsersModal from "../Components/AllocateUsersModal";
import CriteriaLoader from "../Components/CriteriaLoader";
import GenericCardWorkflow from "../Components/GenericCardWorkflow";

import { nbaDashboardService } from "../Services/NBA-dashboard.service";
import { nbaAllocationService } from "../Services/NBA-Allocation.service";
import { allocateUsersModalService } from "../Services/AllocateUsersModal.service";
import { newnbaCriteria7Service } from "../Services/NewNBA-Criteria7.service";
import { newnbaCriteria1Service } from "../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
// import Swal from "sweetalert2";

import { ReportService } from "../Services/Report.Service";

const NBACriteria7Optimized = () => {
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
  const [currentUserInfo, setCurrentUserInfo] = useState({});
  const [isSubCoordinator, setIsSubCoordinator] = useState(false);
  const [alert, setAlert] = useState(null);

  const [sectionMarks, setSectionMarks] = useState({});
  const getTotalMarks = (sectionCode) => {
    const marks = {
      '7.1': 50,
      '7.2': 20,
      '7.3': 10,
      '7.4': 10,
      '7.5': 10,
      '7.6':10,v
    };
    return marks[sectionCode] || 0;
  };
  const [refreshMoSectionId, setRefreshMoSectionId] = useState(null);

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // New state for card-based workflow
  const [cardData, setCardData] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const s3DocumentUrl =
    "https://wccdm.s3.ap-south-1.amazonaws.com/nba/1765293883-7.1.PNG";

  // Card configuration for Criteria 7
  const cardConfig = {
    "7.1": {
      title: "Innovation Lab Entry",
      statusField: "approval_status",
      userField: "other_staff_id",
      nameFields: ["firstname", "lastname"],
      idField: "id",
      isCoordinatorField: "is_coordinator_entry"
    },
    "7.2": {
      title: "Laboratory Learning Entry",
      statusField: "approval_status",
      userField: "other_staff_id",
      nameFields: ["firstname", "lastname"],
      idField: "id",
      isCoordinatorField: "is_coordinator_entry"
    },
    "7.3": {
      title: "Lab Maintenance Entry",
      statusField: "approval_status",
      userField: "other_staff_id",
      nameFields: ["firstname", "lastname"],
      idField: "id",
      isCoordinatorField: "is_coordinator_entry"
    },
    "7.4": {
      title: "Lab Maintenance Entry",
      statusField: "approval_status",
      userField: "other_staff_id",
      nameFields: ["firstname", "lastname"],
      idField: "id",
      isCoordinatorField: "is_coordinator_entry"
    },
    "7.5": {
      title: "Lab Maintenance Entry",
      statusField: "approval_status",
      userField: "other_staff_id",
      nameFields: ["firstname", "lastname"],
      idField: "id",
      isCoordinatorField: "is_coordinator_entry"
    },
    "7.6": {
      title: "Lab Maintenance Entry",
      statusField: "approval_status",
      userField: "other_staff_id",
      nameFields: ["firstname", "lastname"],
      idField: "id",
      isCoordinatorField: "is_coordinator_entry"
    },
  };


  const cardServiceConfig = {
    "7.1": {
      getContributorCards: newnbaCriteria7Service.getAllCriteria7_1_Cards,
      getOwnData: newnbaCriteria7Service.getCriteria7_1_Data,
      updateStatus: newnbaCriteria7Service.updateCriteria7_1_Status,
      // idField: "innovation_lab_id",
    },
    "7.2": {
      getContributorCards: newnbaCriteria7Service.getAllCriteria7_2_Cards,
      getOwnData: newnbaCriteria7Service.getCriteria7_2_Data,
      updateStatus: newnbaCriteria7Service.updateCriteria7_2_Status,
      // idField: "lab_learning_facilities_id",
    },
    "7.3": {
      getContributorCards: newnbaCriteria7Service.getAllCriteria7_3_Cards,
      getOwnData: newnbaCriteria7Service.getCriteria7_3_Data,
      updateStatus: newnbaCriteria7Service.updateCriteria7_3_Status,
    },
    "7.4": {
      getContributorCards: newnbaCriteria7Service.getAllCriteria7_4_Cards,
      getOwnData: newnbaCriteria7Service.getCriteria7_4_Data,
      updateStatus: newnbaCriteria7Service.updateCriteria7_4_Status,
    },
    "7.5": {
      getContributorCards: newnbaCriteria7Service.getAllCriteria7_5_Cards,
      getOwnData: newnbaCriteria7Service.getCriteria7_5_Data,
      updateStatus: newnbaCriteria7Service.updateCriteria7_5_Status,
    },
     "7.6": {
      getContributorCards: newnbaCriteria7Service.getAllCriteria7_6_Cards,
      getOwnData: newnbaCriteria7Service.getCriteria7_6_Data,
      updateStatus: newnbaCriteria7Service.updateCriteria7_6_Status,
    }
  };

  // Helper: resolve section code (e.g. "7.1") for a given subLevel2Id using keyIndicators
  const getSectionCodeBySubLevelId = (subLevel2Id) => {
    const indicator = keyIndicators.find(i => Number(i.subLevel2Id) === Number(subLevel2Id));
    if (!indicator) return null;
    // indicator.rawName expected like "7.1. Some title" or "7.1"
    const match = (indicator.rawName || "").match(/^(\d+\.\d+)/);
    return match ? match[1] : null;
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

    setIsSubCoordinator(isUserSubCoordinator);

    setIsContributor(isUserContributor);

    loadOptimizedData(isUserContributor, isUserSubCoordinator);
  }, [nbaAccreditedProgramId, nbaCriteriaId, nbaCriteriaSubLevel1Id, navigate]);

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
      setLoading(false);
    }
  };

  const apiService = (subLevel2Id) => {
    if (!subLevel2Id) return null;

    const sectionCode = getSectionCodeBySubLevelId(subLevel2Id);

    const service = cardServiceConfig[sectionCode];
    console.log("Service in ", service);

    return {
      updateCardStatus: service?.updateStatus || (() => Promise.reject(`🚫 No update service for ${sectionCode}`)),
      // getCardData: service?.getContributorCards || (() => Promise.resolve([])),
      // getOwnData: service?.getOwnData || (() => Promise.resolve(null)),
    };
  };


  const fetchCoordinatorCriteria = async () => {
    try {
      const res = await nbaDashboardService.getSubCriteriasbycycleCriteriaId(
        nbaAccreditedProgramId,
        nbaCriteriaId
      );
      console.log("🔍 DEBUG: Coordinator criteria response:", res);
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
      console.error("Error fetching coordinator criteria:", e);
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
      const staffId = userInfo.school_user_id || userInfo.user_id;

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
    const cardDataMap = {};

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
          // For coordinator, first get allocation data - ONLY CONTRIBUTORS, NOT SUB-COORDINATORS
          const res = await allocateUsersModalService.getAllocateUsers(subLevel2Id);
          const list = Array.isArray(res) ? res : [];

          // Filter out any sub-coordinator data that might interfere
          const contributorList = list.filter(item =>
            item.contributor &&
            item.contributor.other_staff_id &&
            !item.isSubCoordinator // Ensure we only get contributors
          );

          users = contributorList.map((item) => ({
            school_user: {
              firstname: item.contributor?.firstname || "User",
              lastname: item.contributor?.lastname || "",
              school_user_id: item.contributor?.other_staff_id,
            },
            nba_contributor_allocation_id: item.allocation_id,
            completed: item.status === "COMPLETED",
            isContributor: true, // Mark as contributor explicitly
          }));

          // Card details will be fetched when section is expanded for live updates

          hasData = hasData || contributorList.some(item => item.has_data || item.status === "SUBMITTED");
          completed = users.some(u => u.completed);
        }
      } catch (err) {
        // Error handled silently
      }

      usersMap[subLevel2Id] = users;
      statusMap[subLevel2Id] = completed;
      filledMap[subLevel2Id] = hasData;
    }

    setAllocatedUsers(usersMap);
    setCompletedStatus(statusMap);
    setDataFilledStatus(filledMap);
    setCardData(cardDataMap);
  };

  const toggleSection = async (id) => {
    console.log("🔄 DEBUG: toggleSection called with id:", id);

    const wasExpanded = expandedSectionId === id;
    console.log("📖 DEBUG: wasExpanded:", wasExpanded);

    setExpandedSectionId(prev => (prev === id ? null : id));

    // If expanding a section and it's 7.1, fetch card details for live updates
    if (!wasExpanded) {
      const indicator = keyIndicators.find(ind => ind.subLevel2Id === id);
      console.log("🔍 DEBUG: Found indicator:", indicator);

      if (indicator && indicator.rawName) {
        console.log("✅ DEBUG: This is a 7.1 section, fetching card details...");
        await fetchCardDetails(id);
      } else {
        console.log("❌ DEBUG: Not a 7.1 section or no indicator found");
      }
    }
  };

  const openAllocationModal = (indicator) => {
    setSelectedIndicator(indicator);
    setIsAllocateModalOpen(true);
  };


  // Fetch card details for coordinator view
  const fetchCardDetails = async (cycleSubCategoryId) => {
    console.log("✔ fetchCardDetails called", cycleSubCategoryId);

    const sectionCode = getSectionCodeBySubLevelId(cycleSubCategoryId);
    if (!sectionCode) {
      console.error(`❌ Could not determine section code for subLevel2Id ${cycleSubCategoryId}`);
      return [];
    }

    const config = cardServiceConfig[sectionCode];

    if (!config) {
      console.error(`❌ No card fetch config found for section ${section}`);
      return [];
    }

    try {
      // 1️⃣ Fetch contributors dynamically
      const cardDetails = await config.getContributorCards(cycleSubCategoryId);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");

      const currentStaffId =
        userInfo?.rawData?.other_staff_id ||
        userInfo?.user_id ||
        userInfo2?.other_staff_id ||
        userInfo2?.user_id;

      let allCards = [...cardDetails];

      // 2️⃣ Fetch coordinator (own) entry
      if (currentStaffId) {
        try {
          const ownData = await config.getOwnData(cycleSubCategoryId, currentStaffId);

          const record = Array.isArray(ownData) ? ownData[0] : ownData;

          if (record && record.id) {
            const alreadyExists = cardDetails.some(
              (c) => c.other_staff_id === currentStaffId
            );

            if (!alreadyExists) {
              allCards.unshift({
                ...record,
                is_coordinator_entry: true,
                approval_status: "COORDINATOR",
                firstname: record.firstname || userInfo?.rawData?.firstname || "Coordinator",
                lastname: record.lastname || userInfo?.rawData?.lastname || "",
                other_staff_id: currentStaffId
              });
            }
          }
        } catch (err) {
          console.log("⚠ No coordinator data found:", err);
        }
      }

      setCardData((prev) => ({
        ...prev,
        [cycleSubCategoryId]: allCards
      }));

      return allCards;
    } catch (error) {
      console.error("❌ Failed to fetch:", error);
      toast.error("Failed to load cards");
      return [];
    }
  };


  // Handle card click to view details
  const handleCardClick = async (subLevel2Id, userStaffId, cardItem = null) => {
    console.log("🎯 CRITERIA 7 - handleCardClick called:");
    console.log("  - subLevel2Id:", subLevel2Id);
    console.log("  - userStaffId:", userStaffId);
    console.log("  - cardItem:", cardItem);
    console.log("  - cardConfig:", cardConfig);
    console.log("  - cardConfig.idField:", cardConfig.idField);
    console.log("  - cardItem?.[cardConfig.idField]:", cardItem?.[cardConfig.idField]);

    try {
      const selectedCardData = {
        cycleSubCategoryId: subLevel2Id, // Keep original type
        otherStaffId: userStaffId, // Keep original type
        editMode: true,
        innovationLabId: cardItem?.[cardConfig.idField] || null,
        cardData: cardItem
      };

      console.log("🎯 CRITERIA 7 - Setting selectedCard:", selectedCardData);
      console.log("🎯 CRITERIA 7 - subLevel2Id type:", typeof subLevel2Id, "value:", subLevel2Id);
      console.log("🎯 CRITERIA 7 - selectedCardData.cycleSubCategoryId type:", typeof selectedCardData.cycleSubCategoryId, "value:", selectedCardData.cycleSubCategoryId);
      setSelectedCard(selectedCardData);
    } catch (error) {
      console.error("❌ CRITERIA 7 - Error in handleCardClick:", error);
      toast.error("Failed to load entry details");
    }
  };

  // Handle status change from GenericCardWorkflow
  const handleStatusChange = async (cardItem, newStatus) => {
    const subLevel2Id = selectedCard?.cycleSubCategoryId || expandedSectionId;
    if (subLevel2Id) {
      await fetchCardDetails(subLevel2Id);
      setApprovalStatus(prev => ({
        ...prev,
        [cardItem[cardConfig.idField]]: newStatus
      }));
    }
  };

  // Handle change status - show options for PENDING, direct action for others
  const handleChangeStatus = async (subLevel2Id, cardData) => {
    const currentStatus = cardData.approval_status;

    // Check if coordinator has already made a decision - subcoordinators cannot change it
    if (isSubCoordinator && (currentStatus === 'APPROVED_BY_COORDINATOR' || currentStatus === 'REJECTED_BY_COORDINATOR')) {
      await Swal.fire({
        title: "Status can't get change",
        text: 'This is already approved by coordinator.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // If status is PENDING, show options to choose approval or rejection
    if (currentStatus === 'PENDING') {
      const result = await Swal.fire({
        title: 'Change Status',
        text: 'Choose the new status for this entry:',
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Approve',
        denyButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#16a34a',
        denyButtonColor: '#dc2626'
      });

      if (result.isConfirmed) {
        // Approve - ask for approval reason
        const { value: approvalReason } = await Swal.fire({
          title: 'Approval Reason',
          text: 'Please provide a reason for approval:',
          input: 'textarea',
          inputPlaceholder: 'Enter approval reason...',
          showCancelButton: true,
          confirmButtonText: 'Approve',
          confirmButtonColor: '#16a34a',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value || value.trim() === '') {
              return 'Approval reason is required';
            }
          }
        });

        if (approvalReason) {
          const approvalStatus = isSubCoordinator ? 'APPROVED_BY_SUB_COORDINATOR' : 'APPROVED_BY_COORDINATOR';
          await updateStatus(subLevel2Id, cardData, approvalStatus, approvalReason);
        }
      } else if (result.isDenied) {
        // Reject - ask for reason
        const { value: rejectionReason } = await Swal.fire({
          title: 'Rejection Reason',
          text: 'Please provide a reason for rejection:',
          input: 'textarea',
          inputPlaceholder: 'Enter rejection reason...',
          showCancelButton: true,
          confirmButtonText: 'Reject',
          confirmButtonColor: '#dc2626',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value || value.trim() === '') {
              return 'Rejection reason is required';
            }
          }
        });

        if (rejectionReason) {
          const rejectionStatus = isSubCoordinator ? 'REJECTED_BY_SUB_COORDINATOR' : 'REJECTED_BY_COORDINATOR';
          await updateStatus(subLevel2Id, cardData, rejectionStatus, rejectionReason);
        }
      }
    } else {
      // For other statuses, determine available options based on user type and current status
      let statusOptions = [];

      if (isSubCoordinator) {
        // Sub-coordinators can only work with their own decisions and PENDING
        statusOptions = ['PENDING', 'APPROVED_BY_SUB_COORDINATOR', 'REJECTED_BY_SUB_COORDINATOR'];
      } else {
        // Coordinators can work with all statuses
        statusOptions = ['PENDING', 'APPROVED_BY_COORDINATOR', 'REJECTED_BY_COORDINATOR', 'APPROVED_BY_SUB_COORDINATOR', 'REJECTED_BY_SUB_COORDINATOR'];
      }

      const currentIndex = statusOptions.indexOf(currentStatus);
      if (currentIndex === -1) {
        // Current status not in available options
        await Swal.fire({
          title: 'Cannot Change Status',
          text: 'You do not have permission to modify this status.',
          icon: 'warning',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      const nextIndex = (currentIndex + 1) % statusOptions.length;
      const newStatus = statusOptions[nextIndex];

      if (newStatus.includes('REJECTED')) {
        // Ask for rejection reason
        const { value: rejectionReason } = await Swal.fire({
          title: 'Rejection Reason',
          text: 'Please provide a reason for rejection:',
          input: 'textarea',
          inputPlaceholder: 'Enter rejection reason...',
          showCancelButton: true,
          confirmButtonText: 'Reject',
          confirmButtonColor: '#dc2626',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value || value.trim() === '') {
              return 'Rejection reason is required';
            }
          }
        });

        if (rejectionReason) {
          await updateStatus(subLevel2Id, cardData, newStatus, rejectionReason);
        }
      } else if (newStatus.includes('APPROVED')) {
        // Ask for approval reason
        const { value: approvalReason } = await Swal.fire({
          title: 'Approval Reason',
          text: 'Please provide a reason for approval:',
          input: 'textarea',
          inputPlaceholder: 'Enter approval reason...',
          showCancelButton: true,
          confirmButtonText: 'Approve',
          confirmButtonColor: '#16a34a',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value || value.trim() === '') {
              return 'Approval reason is required';
            }
          }
        });

        if (approvalReason) {
          await updateStatus(subLevel2Id, cardData, newStatus, approvalReason);
        }
      } else {
        // For PENDING, just confirm
        const result = await Swal.fire({
          title: 'Change Status',
          text: `Change status from ${currentStatus} to ${newStatus}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Change',
          confirmButtonColor: '#f59e0b',
          cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
          await updateStatus(subLevel2Id, cardData, newStatus, null);
        }
      }
    }
  };

  // Helper function to update status
  const updateStatus = async (subLevel2Id, cardData, newStatus, reason) => {
    console.log("inside", subLevel2Id, cardData, newStatus, reason)
    try {
      const sectionCode = getSectionCodeBySubLevelId(subLevel2Id);
      console.log("sectionCode", sectionCode);
      if (!sectionCode) throw new Error("Unable to determine section for card update");

      const config = cardServiceConfig[sectionCode];
      if (!config?.updateStatus) throw new Error(`Update not configured for section ${sectionCode}`);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const staffId = userInfo?.rawData?.other_staff_id || userInfo.user_id;
      const approvedBy = userInfo?.rawData?.other_staff_id || userInfo.user_id;
      const approvedByName = `${userInfo.firstname || ''} ${userInfo.lastname || ''}`.trim();

      const statusPayload = {
        innovationLabId: cardData.innovation_lab_id,
        approvalStatus: newStatus,
        rejectionReason: (newStatus === 'REJECTED_BY_COORDINATOR' || newStatus === 'REJECTED_BY_SUB_COORDINATOR') ? reason : null,
        approvalReason: (newStatus === 'APPROVED_BY_COORDINATOR' || newStatus === 'APPROVED_BY_SUB_COORDINATOR') ? reason : null,
        approvedBy: approvedBy,
        approvedByName: approvedByName
      };

      await config.updateStatus(statusPayload, staffId);
      // await newnbaCriteria7Service.updateCardStatus(statusPayload ,staffId );

      await Swal.fire({
        title: 'Status Updated!',
        text: `Status changed to ${newStatus} successfully!`,
        icon: 'success',
        confirmButtonColor: '#2163c1'
      });

      await fetchCardDetails(subLevel2Id);
      setApprovalStatus(prev => ({
        ...prev,
        [cardData.innovation_lab_id]: newStatus
      }));
    } catch (error) {
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to change status',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
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
      const response = await ReportService.getReportCri7(cycleSubCategoryIds);

      // Handle the blob response for file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Criterion7_Report_${new Date().toISOString().split('T')[0]}.pdf`;
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
    return <CriteriaLoader criterionNumber={7} progress={progress} />;
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
                  Criterion 7: Continuous Improvement
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
                  CR-7. R
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
                >
                  ER
                </button>
                <button
                  onClick={() => {
                    navigate("/nba/view-part-b", {
                      state: stateFromRoute
                    });
                  }}
                  className="flex items-center gap-2 bg-[#2163c1] hover:bg-[#1a4f9a] text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg cursor-pointer"
                >
                  Back
                </button>
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
                const rawName = indicator.rawName || "";
                const sectionMatch = rawName.match(/^(\d+\.\d+)/);
                const actualSectionCode = sectionMatch ? sectionMatch[1] : `7.${index + 1}`;
                const sectionNumber = actualSectionCode.split('.')[1] || (index + 1);

                const subLevel2Id = indicator.subLevel2Id;
                const users = allocatedUsers[subLevel2Id] || [];
                const hasAllocation = users.length > 0;
                const isCompleted = !!completedStatus[subLevel2Id];
                const hasDataFilled = !!dataFilledStatus[subLevel2Id];
                const isExpanded = expandedSectionId === subLevel2Id;

                if (isContributor && !hasAllocation) return null;

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
                            className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                              isCompleted ? "bg-green-500" : "bg-[#2163c1]"
                            }`}
                          >
                            {sectionNumber}
                          </div>
                        </div> */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {rawName}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            {isCompleted && (
                              <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                Completed
                              </span>
                            )}
                            {hasAllocation && !isContributor && (
                              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full">
                                Contributors Allocated
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
                            {hasAllocation ? "Allocate" : "Allocate"}
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
                          <CriterionForm
                            section={actualSectionCode}
                            nba_accredited_program_id={nbaAccreditedProgramId}
                            academic_year={academicYear}
                            nba_criteria_sub_level2_id={subLevel2Id}
                            contributor_allocation_id={users[0]?.nba_contributor_allocation_id || null}
                            completed={isCompleted}
                            isContributorEditable={true}
                          />
                        ) : hasAllocation ? (
                          (hasDataFilled || (cardData[subLevel2Id] && cardData[subLevel2Id].length > 0)) ? (
                            <div className="space-y-4">
                              <GenericCardWorkflow
                                cycleSubCategoryId={subLevel2Id}
                                cardData={cardData[subLevel2Id] || []}
                                onCardClick={handleCardClick}
                                onStatusChange={handleStatusChange}
                                apiService={apiService(subLevel2Id)}
                                cardConfig={cardConfig[getSectionCodeBySubLevelId(subLevel2Id)]}
                                isSubCoordinator={isSubCoordinator}
                              />

                              {(() => {
                                const shouldShow = selectedCard && selectedCard.cycleSubCategoryId == subLevel2Id;
                                console.log("🎯 CRITERIA 7 - Form render check:");
                                console.log("  - selectedCard exists:", !!selectedCard);
                                console.log("  - selectedCard:", selectedCard);
                                console.log("  - selectedCard.cycleSubCategoryId:", selectedCard?.cycleSubCategoryId, typeof selectedCard?.cycleSubCategoryId);
                                console.log("  - subLevel2Id:", subLevel2Id, typeof subLevel2Id);
                                console.log("  - Loose equality check:", selectedCard?.cycleSubCategoryId == subLevel2Id);
                                console.log("  - Strict equality check:", selectedCard?.cycleSubCategoryId === subLevel2Id);
                                console.log("  - Final shouldShow:", shouldShow);
                                return shouldShow;
                              })() && (
                                  <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                      <h5 className="text-lg font-semibold text-gray-900">
                                        Entry Details
                                      </h5>
                                      <button
                                        onClick={() => setSelectedCard(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <i className="fa-solid fa-times"></i>
                                      </button>
                                    </div>
                                    <CriterionForm
                                      section={actualSectionCode}
                                      nba_accredited_program_id={nbaAccreditedProgramId}
                                      academic_year={academicYear}
                                      nba_criteria_sub_level2_id={subLevel2Id}
                                      contributor_allocation_id={null}
                                      completed={isCompleted}
                                      isContributorEditable={isSubCoordinator ? false : (selectedCard.editMode || false)}
                                      otherStaffId={selectedCard.otherStaffId}
                                      editMode={isSubCoordinator ? false : (selectedCard.editMode || false)}
                                      innovationLabId={selectedCard.innovationLabId || null}
                                      isSubCoordinator={isSubCoordinator}
                                    />
                                  </div>
                                )}
                            </div>
                          ) : (
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
                          )
                        ) : (
                          // No contributor → Coordinator fills himself
                          <CriterionForm
                            section={actualSectionCode}
                            nba_accredited_program_id={nbaAccreditedProgramId}
                            academic_year={academicYear}
                            nba_criteria_sub_level2_id={subLevel2Id}
                            contributor_allocation_id={null}
                            completed={isCompleted}
                            isContributorEditable={!isSubCoordinator}
                            isSubCoordinator={isSubCoordinator}
                          />
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
          }}
        />
      )}
    </>
  );
};

export default NBACriteria7Optimized;