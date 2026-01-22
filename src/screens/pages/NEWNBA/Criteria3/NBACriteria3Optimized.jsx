// src/screens/pages/NEWNBA/Criteria3/NBACriteria3Optimized.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Modal from "react-modal";
import SweetAlert from "react-bootstrap-sweetalert";
import { ChevronDown } from "lucide-react";

import CriterionForm3 from "../Components/Criteria3/CriterionForm3";
import AllocateUsersModal from "../Components/AllocateUsersModal";
import CriteriaLoader from "../Components/CriteriaLoader";
import GenericCardWorkflow from "../Components/GenericCardWorkflow";

import { nbaDashboardService } from "../Services/NBA-dashboard.service";
import { nbaAllocationService } from "../Services/NBA-Allocation.service";
import { allocateUsersModalService } from "../Services/AllocateUsersModal.service";
import { newnbaCriteria3Service } from "../Services/NewNBA-Criteria3.service";
import { newnbaCriteria1Service } from "../Services/NewNBA-Criteria1.service";
import { ReportService } from "../Services/Report.Service";

const NBACriteria3Optimized = () => {
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
  const programId = stateFromRoute.programId || stateFromRoute.taskData?.cycle_sub_category?.cycle_category?.cycle?.program?.program_id || null;

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const s3DocumentUrl =
    "https://wccdm.s3.ap-south-1.amazonaws.com/nba/1765292700-merged_vertical_3series_final.png";

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [cardData, setCardData] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);
  const [alert, setAlert] = useState(null);

  // === NEW: Section Marks (MO, TM, % ACH) ===
  const [sectionMarks, setSectionMarks] = useState({});
  const getTotalMarks = (sectionCode) => {
    const marks = {
      '3.1': 20,
      '3.2': 30,
      '3.3': 50,
      '3.4': 50,
      '3.5': 20,
      '3.6': 10,
      '3.7': 10,
      '3.8': 10
    };
    return marks[sectionCode] || 0;
  };
  const [refreshMoSectionId, setRefreshMoSectionId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    if (!nbaAccreditedProgramId || !nbaCriteriaId || !nbaCriteriaSubLevel1Id) {
      navigate("/nba/view-part-b");
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setCurrentUserInfo(userInfo);

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

        // Initialize section marks with TM
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

      const res = await nbaAllocationService.getAllAllocatedListingContributor(staffId);
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

      // Initialize section marks with TM
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
      console.error(e);
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

          users = list.map((item) => ({
            school_user: {
              firstname: item.contributor?.firstname || "User",
              lastname: item.contributor?.lastname || "",
              school_user_id: item.contributor?.other_staff_id,
            },
            nba_contributor_allocation_id: item.allocation_id,
            completed: item.status === "COMPLETED",
          }));

          hasData = list.some(item => item.has_data || item.status === "SUBMITTED");
          completed = users.some(u => u.completed);
        }
      } catch (err) {
        console.error(`Error for section ${subLevel2Id}:`, err);
      }

      usersMap[subLevel2Id] = users;
      statusMap[subLevel2Id] = completed;
      filledMap[subLevel2Id] = hasData;
    }

    setAllocatedUsers(usersMap);
    setCompletedStatus(statusMap);
    setDataFilledStatus(filledMap);
  };

const fetchCardDetails = async (cycleSubCategoryId) => {
  try {
    const indicator = keyIndicators.find(ind => ind.subLevel2Id === cycleSubCategoryId);
    const sectionName = indicator?.rawName || "";

    let cardDetails;

    if (sectionName.includes("3.1")) {
      cardDetails = await newnbaCriteria3Service.getAllCriteria3_1_Data(cycleSubCategoryId);

      // ✅ NORMALIZE ID FOR 3.1
      cardDetails = (cardDetails || []).map(card => ({
        ...card,
        id: card.course_outcome_correlation_id // 🔥 critical fix
      }));

    } else if (sectionName.includes("3.2")) {
      cardDetails = await newnbaCriteria3Service.getAllCriteria3_2_Data(cycleSubCategoryId);

    } else {
      cardDetails = await newnbaCriteria3Service.getAllCriteria3_3_Data(cycleSubCategoryId);
    }

    const currentUserInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const currentUserInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const currentStaffId =
      currentUserInfo?.rawData?.other_staff_id ||
      currentUserInfo.user_id ||
      currentUserInfo2?.other_staff_id ||
      currentUserInfo2?.user_id;

    let allCards = [...cardDetails];
    console.log("allCards", allCards);

    // ✅ Only fetch coordinator data for 3.1
    if (currentStaffId && sectionName.includes("3.1")) {
      try {
        const coordinatorData =
          await newnbaCriteria3Service.getCriteria3_1_Data(cycleSubCategoryId, currentStaffId);

        const coordinatorRecord = Array.isArray(coordinatorData)
          ? coordinatorData[0]
          : coordinatorData;

        if (coordinatorRecord?.course_outcome_correlation_id) {
          const existingCard = allCards.find(
            card => card.other_staff_id === currentStaffId
          );

          if (!existingCard) {
            const coordinatorCard = {
              ...coordinatorRecord,
              id: coordinatorRecord.course_outcome_correlation_id, // ✅ normalize here too
              is_coordinator_entry: true,
              approval_status: "COORDINATORS_DATA",
              firstname:
                coordinatorRecord.firstname ||
                currentUserInfo?.rawData?.firstname ||
                currentUserInfo2?.firstname ||
                "Coordinator",
              lastname:
                coordinatorRecord.lastname ||
                currentUserInfo?.rawData?.lastname ||
                currentUserInfo2?.lastname ||
                "",
              other_staff_id: currentStaffId
            };

            allCards.unshift(coordinatorCard);
          }
        }
      } catch (coordinatorError) {
        // coordinator not filled
      }
    }

    setCardData(prev => ({
      ...prev,
      [cycleSubCategoryId]: allCards
    }));

    return allCards;
  } catch (error) {
    console.error("Failed to fetch card details:", error);
    return [];
  }
};


  const handleCardClick = async (subLevel2Id, userStaffId, cardItem = null) => {
    setSelectedCard({
      cycleSubCategoryId: subLevel2Id,
      otherStaffId: userStaffId,
      editMode: true,
      teachingLearningQualityId: cardItem?.id || null,
      cardData: cardItem
    });
  };

  const handleStatusChange = async (cardItem, newStatus) => {
    const subLevel2Id = selectedCard?.cycleSubCategoryId || expandedSectionId;
    if (subLevel2Id) {
      await fetchCardDetails(subLevel2Id);
      setApprovalStatus(prev => ({
        ...prev,
        [cardItem.id]: newStatus
      }));
    }
  };

  const toggleSection = async (id) => {
    const wasExpanded = expandedSectionId === id;
    setExpandedSectionId(prev => (prev === id ? null : id));

    if (!wasExpanded) {
      await fetchCardDetails(id);
    }
  };

  const openAllocationModal = (indicator) => {
    setSelectedIndicator(indicator);
    setIsAllocateModalOpen(true);
  };

  const handleGenerateReport = async () => {
    try {
      const cycleSubCategoryIds = keyIndicators.map(indicator => indicator.subLevel2Id);
      if (cycleSubCategoryIds.length === 0) {
        alert("No criteria sections available to generate report.");
        return;
      }

      const response = await ReportService.getReportCri3(cycleSubCategoryIds);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Criterion3_Report_${new Date().toISOString().split('T')[0]}.pdf`;
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
    return <CriteriaLoader criterionNumber={3} progress={progress} />;
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
                  Criterion 3: Course Outcomes and Program Outcomes
                </h1>
                <nav className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                  {isContributor || isSubCoordinator ? (
                    <span>{breadcrumbforCo_SCO}</span>
                  ) : (
                    <>
                      <span>{programName}</span>
                      <span>›</span>
                      <span>{cycleName}</span>
                      <span>›</span>
                      <span>{academicYear}</span>
                    </>
                  )}
                </nav>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center bg-[#2163c1] hover:bg-[#1a4f9a] text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
                >
                  CR-3. R
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
                  ← Back
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
                const rawName = indicator.rawName || "";
                const sectionMatch = rawName.match(/^(\d+\.\d+)/);
                const actualSectionCode = sectionMatch ? sectionMatch[1] : `3.${index + 1}`;
                const sectionNumber = actualSectionCode.split('.')[1] || (index + 1);

                const subLevel2Id = indicator.subLevel2Id;
                const users = allocatedUsers[subLevel2Id] || [];
                const hasAllocation = users.length > 0;
                const isCompleted = !!completedStatus[subLevel2Id];
                const hasDataFilled = !!dataFilledStatus[subLevel2Id];
                const isExpanded = expandedSectionId === subLevel2Id;

                if (isContributor && !isSubCoordinator && !hasAllocation) return null;

                return (
                  <div
                    key={subLevel2Id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
                  >
                    <div
                      onClick={() => toggleSection(subLevel2Id)}
                      className={`px-6 py-5 flex items-center justify-between cursor-pointer transition-all ${isExpanded ? "bg-indigo-50 border-b border-indigo-200" : "bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{rawName}</h3>
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
                          </div>

                          {/* MO / TM / % ACH */}
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
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                                {sectionMarks[subLevel2Id]?.tm || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">% ACH:</label>
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                                {sectionMarks[subLevel2Id]?.mo && sectionMarks[subLevel2Id]?.tm
                                  ? Math.round((sectionMarks[subLevel2Id].mo / sectionMarks[subLevel2Id].tm) * 100)
                                  : 0}%
                              </span>
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

                        {(!isContributor || isSubCoordinator) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAllocationModal(indicator);
                            }}
                            className="px-4 py-2 text-sm font-medium bg-[#2163c1] text-white rounded-lg hover:bg-[#1a4f9a] transition"
                          >
                            Allocate
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
                          (() => {
                            const otherStaffId = users[0]?.school_user?.school_user_id || null;
                            const contributorCards = cardData[subLevel2Id] || [];
                            const userCard = contributorCards.find(card => card.other_staff_id === otherStaffId);
                            const currentStatus = userCard?.approval_status || 'PENDING';
                            const rejectionReason = userCard?.rejection_reason;

                            const getStatusBadgeClass = (status) => {
                              const statusMap = {
                                'APPROVED_BY_COORDINATOR': 'bg-green-100 text-green-700',
                                'APPROVED_BY_SUB_COORDINATOR': 'bg-green-100 text-green-600',
                                'REJECTED_BY_COORDINATOR': 'bg-red-100 text-red-700',
                                'REJECTED_BY_SUB_COORDINATOR': 'bg-red-100 text-red-600',
                                'PENDING': 'bg-yellow-100 text-yellow-700',
                                'SUBMITTED': 'bg-blue-100 text-blue-700'
                              };
                              return statusMap[status] || 'bg-gray-100 text-gray-700';
                            };

                            const getStatusDisplayText = (status) => {
                              switch (status) {
                                case 'APPROVED_BY_COORDINATOR':
                                case 'APPROVED_BY_SUB_COORDINATOR':
                                  return 'Approved';
                                case 'REJECTED_BY_COORDINATOR':
                                case 'REJECTED_BY_SUB_COORDINATOR':
                                  return 'Rejected';
                                case 'PENDING':
                                  return 'Pending Review';
                                default:
                                  return status;
                              }
                            };

                            return (
                              <div className="space-y-4">
                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-lg font-semibold text-gray-900">Your Submission Status</h5>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(currentStatus)}`}>
                                      {getStatusDisplayText(currentStatus)}
                                    </span>
                                  </div>
                                  {userCard && (currentStatus === 'APPROVED_BY_COORDINATOR' || currentStatus === 'APPROVED_BY_SUB_COORDINATOR') && userCard.approved_by_name && (
                                    <div className="mb-3 text-sm text-gray-600">
                                      Approved by: <span className="font-medium">{userCard.approved_by_name}</span>
                                    </div>
                                  )}
                                  {rejectionReason && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                      <div className="font-medium text-gray-700 mb-2">
                                        {(currentStatus === 'APPROVED_BY_COORDINATOR' || currentStatus === 'APPROVED_BY_SUB_COORDINATOR') ? 'Approval Reason:' : 'Rejection Reason:'}
                                      </div>
                                      <div className="text-gray-600 text-sm">{rejectionReason}</div>
                                    </div>
                                  )}
                                </div>

                                <CriterionForm3
                                  section={actualSectionCode}
                                  nba_accredited_program_id={nbaAccreditedProgramId}
                                  academic_year={academicYear}
                                  nba_criteria_sub_level2_id={subLevel2Id}
                                  contributor_allocation_id={users[0]?.nba_contributor_allocation_id || null}
                                  completed={isCompleted}
                                  isContributorEditable={true}
                                  otherStaffId={otherStaffId}
                                  onCardClick={handleCardClick}
                                  onStatusChange={handleStatusChange}
                                  cardData={cardData[subLevel2Id] || []}
                                  programId={programId}
                                />
                              </div>
                            );
                          })()
                        ) : hasAllocation ? (
                          (hasDataFilled || (cardData[subLevel2Id] && cardData[subLevel2Id].length > 0)) ? (
                            <div className="space-y-4">
                              <GenericCardWorkflow
                                cycleSubCategoryId={subLevel2Id}
                                cardData={cardData[subLevel2Id] || []}
                                onCardClick={handleCardClick}
                                onStatusChange={handleStatusChange}
                                apiService={{
                                  updateCardStatus: actualSectionCode === "3.1"
                                    ? newnbaCriteria3Service.updateCriteria3_1_Status
                                    : actualSectionCode === "3.2"
                                      ? newnbaCriteria3Service.updateCriteria3_2_Status
                                      : newnbaCriteria3Service.updateCriteria3_3_Status,
                                  getCardData: () => fetchCardDetails(subLevel2Id)
                                }}
                                cardConfig={{
                                  title: "Entry",
                                  statusField: "approval_status",
                                  userField: "other_staff_id",
                                  nameFields: ["firstname", "lastname"],
                                  idField: "id",
                                  isCoordinatorField: "is_coordinator_entry"
                                }}
                                isSubCoordinator={isSubCoordinator}
                              />

                              {selectedCard && selectedCard.cycleSubCategoryId === subLevel2Id && (
                                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-semibold text-gray-900">Entry Details</h5>
                                    <button onClick={() => setSelectedCard(null)} className="text-gray-500 hover:text-gray-700">
                                      <i className="fa-solid fa-times"></i>
                                    </button>
                                  </div>
                                  <CriterionForm3
                                    section={actualSectionCode}
                                    nba_accredited_program_id={nbaAccreditedProgramId}
                                    academic_year={academicYear}
                                    nba_criteria_sub_level2_id={subLevel2Id}
                                    contributor_allocation_id={null}
                                    completed={isCompleted}
                                    isContributorEditable={isSubCoordinator ? false : (selectedCard.editMode || false)}
                                    otherStaffId={selectedCard.otherStaffId}
                                    editMode={isSubCoordinator ? false : (selectedCard.editMode || false)}
                                    teachingLearningQualityId={selectedCard.teachingLearningQualityId || null}
                                    programId={programId}
                                    isSubCoordinator={isSubCoordinator}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <i className="fa-solid fa-hourglass-half text-3xl text-gray-400"></i>
                              </div>
                              <p className="text-lg text-gray-600">No data has been filled by the allocated contributor(s) yet.</p>
                              <p className="text-sm text-gray-500 mt-2">Waiting for submission...</p>
                            </div>
                          )
                        ) : (
                          (() => {
                            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
                            const otherStaffId = userInfo.other_staff_id || null;
                            return (
                              <CriterionForm3
                                section={actualSectionCode}
                                nba_accredited_program_id={nbaAccreditedProgramId}
                                academic_year={academicYear}
                                nba_criteria_sub_level2_id={subLevel2Id}
                                contributor_allocation_id={null}
                                completed={isCompleted}
                                isContributorEditable={true}
                                otherStaffId={otherStaffId}
                                isSubCoordinator={isSubCoordinator}
                                programId={programId}
                              />
                            );
                          })()
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ER Guidelines Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-6xl h-[95vh] mx-auto outline-none border-0 relative"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-2 z-50"
          ariaHideApp={false}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
            title="Close"
          >
            X
          </button>

          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-[#2163c1] to-[#1a4f9a] text-white rounded-t-xl">
              <div className="flex items-center gap-3 pr-12">
                <div>
                  <h2 className="text-xl font-bold">ER Guidelines</h2>
                  <p className="text-sm opacity-90">Evidence Requirements Documentation</p>
                </div>
              </div>
            </div>

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
                  <div className="hidden h-96 flex-col items-center justify-center text-gray-500">
                    <i className="fa-solid fa-exclamation-triangle text-4xl mb-4"></i>
                    <p className="text-lg font-medium">Unable to load document</p>
                    <p className="text-sm">Please check your internet connection</p>
                  </div>
                </div>
              </div>
            </div>

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

        {/* Allocate Users Modal */}
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
      </div>
    </>
  );
};

export default NBACriteria3Optimized;