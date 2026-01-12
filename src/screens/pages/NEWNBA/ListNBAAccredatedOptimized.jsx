// src/screens/pages/NEWNBA/ListNBAAccredatedOptimized.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";   // ← NEW (v6+)
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";
import { Download, Loader2, BarChart3 } from "lucide-react";

import { authenticationService, authHeader } from "@/_services/api";
import { nbaDashboardService } from "./Services/NBA-dashboard.service.js";
import {
  apiNBARequest,
} from '@/_services/api';
const ListNBAAccredatedOptimized = ({ collegeId }) => {
  const navigate = useNavigate();

  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(20);
  const [alert, setAlert] = useState(null);
  const [downloadStates, setDownloadStates] = useState({});

  const [userInfo, setUserInfo] = useState({
    other_staff_id: null,
    isCoordinator: false,
    isSuperAdmin: false,
  });

  const currentUser = authenticationService.currentUser();

  useEffect(() => {
    const loadData = async () => {
      console.log("🔵 ListNBAAccredatedOptimized: Loading data for collegeId:", collegeId);
      try {
        setProgress(30);

        const profile = await authenticationService.getProfile();
        console.log("🟡 ListNBAAccredatedOptimized: User profile fetched:", profile);
        const staffId = profile?.other_staff_id || profile?.user?.user_id;
        if (!staffId) throw new Error("Staff ID not found");

        const isSuperAdmin = currentUser?.sub === "SUPERADMIN";
        const isCoordinator = profile.is_coordinator || isSuperAdmin;

        setUserInfo({ other_staff_id: staffId, isCoordinator, isSuperAdmin });

        setProgress(60);

        let cycleList = [];

        if (isCoordinator && collegeId) {
          console.log("🟡 ListNBAAccredatedOptimized.loadData: Fetching programs for collegeId:", collegeId);
          const response = await nbaDashboardService.getAccrediatedProgramByCollegeId(collegeId);
          cycleList = Array.isArray(response) ? response : [];
          console.log("🟢 ListNBAAccredatedOptimized.loadData: Cycles loaded:", cycleList);
          cycleList.forEach((cycle, idx) => {
            console.log(`  [Cycle ${idx}] programId: ${cycle.programId}, cycleId: ${cycle.cycleId}, name: ${cycle.programName}`);
          });
        }

        // const sorted = cycleList.sort((a, b) =>
        //   (b.academicYearLabel || "").localeCompare(a.academicYearLabel || "")
        // );

        const sorted = [...cycleList].sort(
          (a, b) => Number(b.cycleId) - Number(a.cycleId)
        );

        setCycles(sorted);
        setProgress(100);
        setTimeout(() => setLoading(false), 500);
      } catch (error) {
        console.error("Failed to load NBA cycles:", error);
        setAlert(
          <SweetAlert error title="Load Failed" onConfirm={() => setAlert(null)}>
            Could not load your NBA cycles. Please refresh.
          </SweetAlert>
        );
        setLoading(false);
      }
    };

    loadData();
  }, [collegeId]);

  const handleViewReport = (cycle) => {
    const type = (cycle.reportTypeCategoryName || "").toLowerCase();

    let targetRoute = "/nba/view-part-b";

    if (type.includes("pre-qualifier") || type.includes("prequalifier")) {
      targetRoute = "/nba/pre-qualifier";
    } else if (type.includes("evaluation")) {
      targetRoute = "/nba/evaluation";
    }

    const navigationState = {
      cycleId: cycle.cycleId,
      cycleName: cycle.cycleName,
      programName: cycle.programName,
      academicYear: cycle.academicYearLabel,
      reportType: cycle.reportTypeCategoryName,
      status: cycle.status,
      programId: cycle.programId,
      collegeId: cycle.collegeId,
    };

    console.log("🔵 ListNBAAccredatedOptimized.handleViewReport:");
    console.log("  - Navigating to:", targetRoute);
    console.log("  - Full cycle object:", cycle);
    console.log("  - Navigation state being passed:", navigationState);
    console.log("  - programId:", navigationState.programId);
    console.log("  - collegeId:", navigationState.collegeId);
    console.log("  - cycleId:", navigationState.cycleId);

    navigate(targetRoute, {
      state: navigationState,
    });
  };

  const handleGraph = (cycle) => {
    // const navigationState = {
    //   cycleId: cycle.cycleId,
    //   cycleName: cycle.cycleName,
    //   programName: cycle.programName,
    //   academicYear: cycle.academicYearLabel,
    //   reportType: cycle.reportTypeCategoryName,
    //   status: cycle.status,
    //   programId: cycle.programId,
    //   collegeId: cycle.collegeId,
    // };

    // console.log("🔵 ListNBAAccredatedOptimized.handleGraph:");
    // console.log("  - Navigating to: /nba/graph");
    // console.log("  - Navigation state:", navigationState);

    navigate("/nba/graph", {
       state: {
    cycleId: cycle.cycleId,
    cycleName: cycle.cycleName,
    programName: cycle.programName,
    academicYear: cycle.academicYearLabel,
    reportType: cycle.reportTypeCategoryName,
    status: cycle.status,
    programId: cycle.programId,
    collegeId: cycle.collegeId,
  },
    });
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    const badges = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      SUBMITTED: "bg-blue-100 text-blue-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
    };
    return badges[s] || "bg-gray-100 text-gray-800";
  };

  const handleDownload = async (cycle) => {
    const { cycleId, reportTypeCategoryName } = cycle;
    if (downloadStates[cycleId]) return;

    setDownloadStates((prev) => ({ ...prev, [cycleId]: true }));

    try {
      const isPrequalifier = (reportTypeCategoryName || "").toLowerCase().includes("pre-qualifier");
      let response;

      if (isPrequalifier) {
        // Use the service function for pre-qualifier report
        response = await nbaDashboardService.getPrequalifireReport(cycleId);
      } else {
        // For other reports, also use the service. Assuming it returns a raw response for blobs.
        response = await nbaDashboardService.getPrequalifireReport(cycleId);
      }

      const blob = await response.blob();  
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${isPrequalifier ? 'Pre-SAR_Report' : 'Pre-Qualifier_Report'}_Cycle${cycleId}_${moment().format("YYYYMMDD")}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      // setAlert(<SweetAlert success title="Download Started!" onConfirm={() => setAlert(null)} />);
    } catch (err) {
      console.error("PDF Download failed:", err);
      setAlert(<SweetAlert error title="Download Failed" onConfirm={() => setAlert(null)} />);
    } finally {
      setDownloadStates((prev) => ({ ...prev, [cycleId]: false }));
    }
  };

  /* --------------------- UPDATED LOADER COLOR ---------------------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">

        {/* Spinner updated to your blue color */}
        <div className="w-16 h-16 border-4 border-[#2163c1] border-t-transparent rounded-full animate-spin mb-6"></div>

        {/* Progress bar updated */}
        <div className="w-96 bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-[#2163c1] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-4 text-lg text-gray-600 font-medium">
          Loading your NBA Cycles... {progress}%
        </p>
      </div>
    );
  }

  return (
    <>
      {alert}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

        {cycles.length === 0 ? (
          <div className="p-16 text-center bg-gray-50">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-500 font-medium">No NBA cycles found</p>
            {userInfo.isCoordinator && (
              <p className="text-sm text-gray-400 mt-3">
                Create your first report from the dashboard
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2163c1] border-b-2 border-gray-200 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Cycle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Report Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                    Graph
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {cycles.map((cycle) => (
                  <tr key={cycle.cycleId} className="hover:bg-indigo-50 transition">

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cycle.academicYearLabel || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{cycle.programName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{cycle.cycleName}</td>

                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {cycle.reportTypeCategoryName || "SAR Report"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          cycle.status
                        )}`}
                      >
                        {cycle.status || "DRAFT"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleGraph(cycle)}
                        className="w-10 h-10 bg-[#2163c1] text-white rounded-full inline-flex items-center justify-center hover:bg-[#1d58ad] transition"
                        title="View Graph"
                      >
                        <BarChart3 className="w-4 h-4 text-white" />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center space-x-3">

                      <button
                        onClick={() => handleViewReport(cycle)}
                        className="px-6 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition"
                      >
                        View Report
                      </button>

                      {userInfo.isCoordinator && (
                        <button
                          onClick={() => handleDownload(cycle)}
                          disabled={downloadStates[cycle.cycleId]}
                          className="w-10 h-10 bg-[#2163c1] text-white rounded-full inline-flex items-center justify-center hover:bg-[#1d58ad] disabled:opacity-50 transition"
                          title="Download PDF"
                        >
                          {downloadStates[cycle.cycleId] ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-white" />
                          )}
                        </button>
                      )}

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 text-center text-xs text-gray-500 border-t">
          NBA Accreditation • Pre-Qualifier • Evaluation • SAR
        </div>

      </div>
    </>
  );
};

export default ListNBAAccredatedOptimized;
