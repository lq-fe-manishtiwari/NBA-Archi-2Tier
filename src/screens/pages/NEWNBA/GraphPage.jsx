import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { X } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { nbaDashboardService } from "./Services/NBA-dashboard.service.js";
import { OtherStaffService } from '../OtherStaff/Service/OtherStaff.service.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraphPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cycleId,
    cycleName,
    programName,
    academicYear,
    reportType,
    status,
    programId,
    collegeId,
  } = location.state || {};

  const [criteriaData, setCriteriaData] = useState([]);
  const [criteriaSummary, setCriteriaSummary] = useState(null);   // in cri 1,2 
  const [subCriteriaDetail, setSubCriteriaDetail] = useState(null);  // 1.1 1.2
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const SUB_CRITERIA_MAP = {
    1: ["1.1", "1.2", "1.3", "1.4", "1.5"],
    2: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"],
    3: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"],
    4: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7"],
    5: ["5.1", "5.2", "5.3", "5.4", "5.5"],
    6: ["6.1", "6.2"],
    7: ["7.1", "7.2", "7.3", "7.4"],
    8: ["8.1", "8.2", "8.3", "8.4"],
    9: ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10", "9.11", "9.12", "9.13", "9.14"],
  };

  const [staff, setStaff] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [statusWiseData, setStatusWiseData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [criteriaChartData, setCriteriaChartData] = useState(null);
  const [filteredContributions, setFilteredContributions] = useState([]);
  const [criteriaWiseChart, setCriteriaWiseChart] = useState(null);
  const [selectedUserCriteria, setSelectedUserCriteria] = useState(null);
  const [showStatusWiseGraph, setShowStatusWiseGraph] = useState(false);

  const getAllOtherStaff = () => {
    OtherStaffService.getAllOtherStaff()
      .then((res) => {
        // Reverse the array so the last item becomes the first
        const reversedData = Array.isArray(res) ? [...res].reverse() : res;
        setStaff(reversedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getdetailsbyUser = async (otherStaffId) => {
    try {
      const response = await nbaDashboardService.getUserDetails(otherStaffId);
      setUserDetails(response);
      setStatusWiseData([]);
      setShowStatusWiseGraph(false);
      setCriteriaChartData(null);
      setSelectedStatus("");
    } catch (error) {
      console.error(error);
    }
  };

const handleStatusChange = (status) => {
  setSelectedStatus(status);

  if (!userDetails) return;

  // Reset selections
  setSelectedCriteria(null);
  setCriteriaSummary(null);
  setSubCriteriaDetail(null);

  if (!status) {
    // If status is cleared, hide status-wise graph
    setShowStatusWiseGraph(false);
    setFilteredContributions([]);
    setCriteriaChartData(null);
    return;
  }

  const filtered = userDetails.contributions.filter(
    item => item.approval_status === status
  );

  if (filtered.length === 0) {
    alert("This status data is not available");
    // setShowStatusWiseGraph(false);
    // setFilteredContributions([]);
    return;
  }

  setFilteredContributions(filtered);
  prepareCriteriaWiseChart(filtered);
  setShowStatusWiseGraph(true);
};

  const prepareCriteriaWiseChart = (data) => {
    if (!data.length) {
      setCriteriaWiseChart(null);
      return;
    }

    const criteriaMap = {};

    data.forEach(item => {
      if (!criteriaMap[item.criteria_code]) {
        criteriaMap[item.criteria_code] = [];
      }
      criteriaMap[item.criteria_code].push(item);
    });

    const labels = Object.keys(criteriaMap);

    const scores = labels.map(code => {
      const items = criteriaMap[code];
      // average ya sum nahi, sirf presence dikhane ke liye 100
      return 100;
    });

    setCriteriaWiseChart({
      criteriaMap,
      chartData: {
        labels: labels.map(c => `Criteria ${c}`),
        datasets: [
          {
            label: "Criteria Available",
            data: scores,
            backgroundColor: "#2163c1",
            borderRadius: 6
          }
        ]
      }
    });
  };

 const criteriaClickOptions = {
  responsive: true,
  onClick: (event, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const criteriaCode =
      criteriaWiseChart.chartData.labels[index].replace("Criteria ", "");

    // Make sure sections is never undefined
    const sections = criteriaWiseChart.criteriaMap[criteriaCode] || [];

    setSelectedUserCriteria({
      criteriaCode,
      sections
    });
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
};



  const handleUserTypeChange = (value) => {
    setSelectedUserType(value);
    setSelectedStaffId("");

    let filtered = [];

    if (value === "COORDINATOR") {
      filtered = staff.filter(s => s.is_coordinator);
    } else if (value === "SUB_COORDINATOR") {
      filtered = staff.filter(s => s.is_sub_coordinator);
    } else if (value === "CONTRIBUTOR") {
      filtered = staff.filter(s => s.is_contributor);
    }

    setFilteredStaff(filtered);
  };

  useEffect(() => {
    if (cycleId) {
      fetchGraphData();
    }
    getAllOtherStaff();
  }, [cycleId]);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const response =
        await nbaDashboardService.getCriteriaSummaryForCriterion(cycleId);

      const allCriteria = Array.from({ length: 9 }, (_, i) => i + 1);

      const apiCriteriaMap = {};
      response.criterias.forEach(item => {
        apiCriteriaMap[item.criteria_code] = {
          score: Number(item.percentage.toFixed(2)),
          cycleCategoryId: item.cycle_category_id,
        };
      });

      const data = allCriteria.map(code => ({
        criterion: `Criterion ${code}`,
        criteria_code: code,
        score: apiCriteriaMap[code]?.score ?? 0,
        contributors: [],
        cycleCategoryId: apiCriteriaMap[code]?.cycleCategoryId ?? null,
      }));

      setCriteriaData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredCriteria = async (status) => {
    try {
      setLoading(true);

      const response = await nbaDashboardService.getCriteriaFilter(
        cycleId,
        status
      );

      console.log("Filtered API Response:", response);

      const allCriteria = Array.from({ length: 9 }, (_, i) => i + 1);

      const apiCriteriaMap = {};
      response.criterias.forEach(item => {
        apiCriteriaMap[item.criteria_code] = {
          score: Number(item.percentage.toFixed(2)),
          cycleCategoryId: item.cycle_category_id,
        };
      });

      const data = allCriteria.map(code => ({
        criterion: `Criterion ${code}`,
        criteria_code: code,
        score: apiCriteriaMap[code]?.score ?? 0,
        contributors: [],
        cycleCategoryId: apiCriteriaMap[code]?.cycleCategoryId ?? null,
      }));

      setCriteriaData(data);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };


  const colors = ['#2163c1', '#34d399'];

  const data = {
    labels: criteriaData.map(item => item.criterion),
    datasets: [
      {
        label: 'Score (%)',
        data: criteriaData.map(item => item.score),
        backgroundColor: criteriaData.map((_, index) => colors[index % colors.length]),
        borderColor: criteriaData.map((_, index) => colors[index % colors.length]),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    // ✅ CLICK ONLY ON BAR
    onClick: async (event, elements) => {
      if (!elements.length) return;

      const index = elements[0].index;
      const clicked = criteriaData[index];

      setSelectedCriteria(clicked);

      try {
        const response =
          await nbaDashboardService.getCriteriaSummary(
            clicked.cycleCategoryId,
            clicked.criteria_code
          );
        console.log("Criteria Summary:", response);
        setCriteriaSummary(response);
      } catch (error) {
        console.error("API error:", error);
      }
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: ctx => `Score: ${ctx.parsed.y}%`,
        },
      },
      title: {
        display: true,
        text: `NBA Criteria Scores - ${programName || ""} ${academicYear || ""}`,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: val => `${val}%`,
        },
      },
    },
  };

  const subCriteriaChartData = React.useMemo(() => {
    if (!selectedCriteria || !criteriaSummary) return null;

    const criterionNo = selectedCriteria.criteria_code;

    const fixedSubCriteria = SUB_CRITERIA_MAP[criterionNo] || [];

    const apiMap = {};
    criteriaSummary.sections?.forEach(item => {
      apiMap[item.section] = Number(item.percentage);
    });

    const scores = fixedSubCriteria.map(sc => apiMap[sc] ?? 0);

    return {
      labels: fixedSubCriteria,
      datasets: [
        {
          label: "Sub-Criteria Score (%)",
          data: scores,
          backgroundColor: "#34d399",
          borderColor: "#0bef9cff",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  }, [criteriaSummary, selectedCriteria]);

  const subCriteriaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Sub-Criteria Graph - ${selectedCriteria?.criterion}`,
      },
      tooltip: {
        callbacks: {
          label: ctx => `Score: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: v => `${v}%`,
        },
      },
    },
    onClick: async (event, elements) => {
      if (!elements.length) return;

      const index = elements[0].index;
      const clickedSub = subCriteriaChartData.labels[index]; //  "1.1"

      const subCriteriaObj = criteriaSummary.sections?.find(
        s => s.section === clickedSub
      );

      if (!subCriteriaObj) {
        console.warn("No sub-criteria info available for API call");
        return;
      }

      try {
        const response = await nbaDashboardService.getSubCriteriaSummary(
          subCriteriaObj.cycle_sub_category_id,
          selectedCriteria.cycleCategoryId,
          clickedSub
        );

        console.log("Sub-Criteria Detailed Data:", response);

        // You can now store it in state if you want to show in modal/table
        // e.g., setSubCriteriaDetail(response);
      } catch (err) {
        console.error("Error fetching sub-criteria summary:", err);
      }
    },
  };

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border border-blue-200">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 border-4 border-[#2163c1] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Loading graph data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border border-blue-200">
      <h1 className="text-3xl font-bold mb-6 text-[#2163c1] text-center">NBA Accreditation Graphs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <svg className="w-7 h-7 text-[#2163c1] mr-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Program</p>
            <p className="font-bold text-gray-800 text-lg">{programName}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <svg className="w-7 h-7 text-[#2163c1] mr-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Academic Year</p>
            <p className="font-bold text-gray-800 text-lg">{academicYear}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <svg className="w-7 h-7 text-[#2163c1] mr-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Cycle</p>
            <p className="font-bold text-gray-800 text-lg">{cycleName}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <svg className="w-7 h-7 text-[#2163c1] mr-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Report Type</p>
            <p className="font-bold text-gray-800 text-lg">{reportType}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center 
hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer w-[40rem]">
          <div className="flex items-center gap-4">
            <select
              value={selectedUserType}
              onChange={(e) => handleUserTypeChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700
  focus:outline-none focus:ring-2 focus:ring-[#2163c1]"
            >
              <option value="">Select User</option>
              <option value="COORDINATOR">Coordinator</option>
              <option value="SUB_COORDINATOR">Sub-Coordinator</option>
              <option value="CONTRIBUTOR">Contributor</option>
            </select>

            <select
              value={selectedStaffId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedStaffId(selectedId);
                if (selectedId) {
                  getdetailsbyUser(selectedId); // PASS other_staff_id
                }
              }}
              disabled={!selectedUserType || !filteredStaff.length}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700
  focus:outline-none focus:ring-2 focus:ring-[#2163c1]"
            >
              <option value="">Select Name</option>

              {filteredStaff.map((staff) => (
                <option key={staff.other_staff_id} value={staff.other_staff_id}>
                  {staff.firstname} {staff.lastname}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              disabled={!selectedStaffId}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700
  focus:outline-none focus:ring-2 focus:ring-[#2163c1]"
            >
              <option value="">Select Status</option>
              <option value="APPROVED_BY_COORDINATOR">Approved</option>
              <option value="REJECTED_BY_COORDINATOR">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>

          </div>
        </div>
      </div>
      {/* main graph */}
      {!showStatusWiseGraph && !selectedStatus && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
          <div className="w-full h-[60vh] min-h-[32rem]">
            <Bar data={data} options={options} />
          </div>
          </div>
        )}
        {selectedCriteria && !showStatusWiseGraph && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-green-200 mb-6 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Selected Criteria Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Criteria</p>
                <p className="font-semibold text-lg text-gray-800">{selectedCriteria.criterion}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Score</p>
                <p className="font-semibold text-lg text-gray-800">{selectedCriteria.score}%</p>
              </div>
            </div>
            {subCriteriaChartData && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mt-6">
                <div className="w-full h-[45vh] min-h-[22rem]">
                  <Bar
                    data={subCriteriaChartData}
                    options={subCriteriaOptions}
                  />
                </div>
              </div>
            )}

            {criteriaChartData && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mt-6">
                <h3 className="text-lg font-bold text-gray-700 mb-3">
                  Criteria {criteriaChartData.criteriaCode} – Section Wise Progress
                </h3>

                <div className="w-full h-[40vh]">
                  <Bar
                    data={criteriaChartData.chartData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: v => `${v}%`
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedCriteria(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Close Report
            </button>
          </div>
        )}
            
      {/* status graph */}
      {selectedStatus && criteriaWiseChart && showStatusWiseGraph && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mt-6">
         <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-bold text-gray-700">
        Status wise Criteria
      </h3>
      <button
        onClick={() => {
    setShowStatusWiseGraph(false);
    setSelectedStatus(""); // reset status
    setSelectedUserCriteria(null); // also reset selected criteria if needed
  }}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
         <div className="w-full h-[35vh]">
            <Bar
              data={criteriaWiseChart.chartData}
              options={criteriaClickOptions}
            />
          </div>
        </div>
      )}
      { selectedStatus && selectedUserCriteria && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-green-200 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Selected Criteria {selectedUserCriteria.criteriaCode} Report
          </h3>
          <div className="w-full h-[40vh]">
            <Bar
              data={{
                labels: selectedUserCriteria.sections.map(s => s.section_code),
                datasets: [
                  {
                    label: "Filled Percentage (%)",
                    data: selectedUserCriteria.sections.map(s =>
                      Number(s.filled_percentage.toFixed(2))
                    ),
                    backgroundColor: "#34d399",
                    borderRadius: 6
                  }
                ]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: v => `${v}%`
                    }
                  }
                }
              }}
            />
          </div>
           <button
      onClick={() => setSelectedUserCriteria(null)}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Close Report
    </button>
        </div>
      )}

    </div>
  );
};

export default GraphPage;