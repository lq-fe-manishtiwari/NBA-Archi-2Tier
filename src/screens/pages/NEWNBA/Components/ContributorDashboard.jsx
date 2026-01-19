import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { nbaDashboardService } from '../Services/NBA-dashboard.service';

// Custom Pie Chart Component
const CustomPieChart = ({ data, onSegmentClick }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return ( 
      <div className="w-80 h-80 mx-auto flex items-center justify-center bg-gray-100 rounded-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  let currentAngle = 0;
  const centerX = 200;
  const centerY = 200;
  const radius = 160;

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // Calculate path for SVG arc
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle += angle;

    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle
    };
  });

  return (
    <div className="flex items-center justify-center gap-12">
      {/* Enhanced Interactive Pie Chart */}
      <div className="relative group">
        <svg width="450" height="450" className="cursor-pointer drop-shadow-2xl transition-all duration-500 group-hover:scale-105">
          {/* Enhanced background effects */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.25"/>
            </filter>
            <filter id="innerShadow">
              <feOffset dx="0" dy="2"/>
              <feGaussianBlur stdDeviation="2" result="offset-blur"/>
              <feFlood floodColor="#000000" floodOpacity="0.1"/>
              <feComposite in2="offset-blur" operator="in"/>
            </filter>
          </defs>
          
          {/* Animated outer rings */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 15}
            fill="none"
            stroke="url(#outerGradient)"
            strokeWidth="1"
            opacity="0.4"
            className="animate-pulse"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 25}
            fill="none"
            stroke="url(#outerGradient)"
            strokeWidth="0.5"
            opacity="0.2"
            className="animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          
          {/* Enhanced gradient definitions */}
          <defs>
            <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <radialGradient id="centerGradient">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>
          </defs>
          
          {/* Pie segments with enhanced interactivity */}
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.pathData}
                fill={`url(#segmentGradient${index})`}
                stroke="white"
                strokeWidth="4"
                className="hover:brightness-110 transition-all duration-500 cursor-pointer"
                onClick={() => onSegmentClick && onSegmentClick(segment.status)}
                filter="url(#shadow)"
                style={{
                  transformOrigin: `${centerX}px ${centerY}px`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.08) rotate(2deg)';
                  e.target.style.filter = 'url(#glow) url(#shadow)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)';
                  e.target.style.filter = 'url(#shadow)';
                }}
              />
              
              {/* Individual segment gradients */}
              <defs>
                <radialGradient id={`segmentGradient${index}`}>
                  <stop offset="0%" stopColor={segment.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={segment.color} stopOpacity="1" />
                </radialGradient>
              </defs>
              
              {/* Enhanced percentage labels */}
              {segment.percentage > 5 && (
                <g>
                  <circle
                    cx={centerX + (radius * 0.75) * Math.cos(((segment.startAngle + segment.endAngle) / 2) * Math.PI / 180)}
                    cy={centerY + (radius * 0.75) * Math.sin(((segment.startAngle + segment.endAngle) / 2) * Math.PI / 180)}
                    r="18"
                    fill="rgba(255,255,255,0.95)"
                    stroke={segment.color}
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                  <text
                    x={centerX + (radius * 0.75) * Math.cos(((segment.startAngle + segment.endAngle) / 2) * Math.PI / 180)}
                    y={centerY + (radius * 0.75) * Math.sin(((segment.startAngle + segment.endAngle) / 2) * Math.PI / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-bold pointer-events-none"
                    fill={segment.color}
                  >
                    {segment.percentage}%
                  </text>
                </g>
              )}
            </g>
          ))}
          
          {/* Enhanced center circle with animation */}
          <circle
            cx={centerX}
            cy={centerY}
            r="70"
            fill="url(#centerGradient)"
            stroke="url(#outerGradient)"
            strokeWidth="4"
            filter="url(#shadow)"
            className="animate-pulse"
          />
          
          {/* Center content with icons */}
          <circle
            cx={centerX}
            cy={centerY}
            r="60"
            fill="rgba(255,255,255,0.1)"
            className="animate-pulse"
            style={{ animationDelay: '0.3s' }}
          />
          
          {/* Center text with better styling */}
          <text
            x={centerX}
            y={centerY - 15}
            textAnchor="middle"
            className="text-4xl font-bold fill-indigo-600"
          >
            {total}
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="text-lg fill-gray-600 font-semibold"
          >
            Total Tasks
          </text>
          <text
            x={centerX}
            y={centerY + 28}
            textAnchor="middle"
            className="text-sm fill-gray-500"
          >
            📊 Click to explore
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="w-64 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Task Summary</h3>
        {segments.map((item, index) => (
          <div
            key={index}
            onClick={() => onSegmentClick && onSegmentClick(item.status)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="font-semibold text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg" style={{ color: item.color }}>
                {item.value}
              </span>
              <span className="text-xs text-gray-500">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

const ContributorDashboard = ({ nbaAccreditedProgramId, academicYear, programName }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    submitted: 0,
    draft: 0,
    tasks: []
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const tasksRef = useRef(null);

  useEffect(() => {
    loadContributorDashboard();
  }, []); // Remove dependency on nbaAccreditedProgramId to show all tasks

  const loadContributorDashboard = async () => {
    try {
      setLoading(true);
      
      // Get current user info - same as ViewNBADashboard
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;

      if (!staffId) {
        console.log("No staff ID found");
        // Set demo data for development
        setDashboardData({
          totalTasks: 8,
          pending: 3,
          approved: 2,
          rejected: 1,
          submitted: 1,
          draft: 1,
          tasks: [
            { id: 1, criteriaName: 'Criteria 9.2', status: 'PENDING', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 2, criteriaName: 'Criteria 9.3', status: 'APPROVED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 3, criteriaName: 'Criteria 9.4', status: 'DRAFT', hasData: false, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 4, criteriaName: 'Criteria 9.5', status: 'SUBMITTED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 5, criteriaName: 'Criteria 9.6', status: 'REJECTED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 6, criteriaName: 'Criteria 9.7', status: 'PENDING', hasData: false, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 7, criteriaName: 'Criteria 9.8', status: 'PENDING', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 8, criteriaName: 'Criteria 9.9', status: 'APPROVED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } }
          ]
        });
        setLoading(false);
        return;
      }
      
      // Use the same API as ViewNBADashboard
      console.log("Fetching contributor tasks using nbaDashboardService for staff ID:", staffId);
      const contributorTasks = await nbaDashboardService.getContributorTasks(staffId);
      
      if (!Array.isArray(contributorTasks) || contributorTasks.length === 0) {
        console.log("No contributor tasks found, using demo data");
        setDashboardData({
          totalTasks: 8,
          pending: 3,
          approved: 2,
          rejected: 1,
          submitted: 1,
          draft: 1,
          tasks: [
            { id: 1, criteriaName: 'Criteria 9.2', status: 'PENDING', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 2, criteriaName: 'Criteria 9.3', status: 'APPROVED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 3, criteriaName: 'Criteria 9.4', status: 'DRAFT', hasData: false, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 4, criteriaName: 'Criteria 9.5', status: 'SUBMITTED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 5, criteriaName: 'Criteria 9.6', status: 'REJECTED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 6, criteriaName: 'Criteria 9.7', status: 'PENDING', hasData: false, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 7, criteriaName: 'Criteria 9.8', status: 'PENDING', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
            { id: 8, criteriaName: 'Criteria 9.9', status: 'APPROVED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } }
          ]
        });
        setLoading(false);
        return;
      }

      console.log("Raw contributor tasks from API:", contributorTasks);

      // Filter tasks for current program if nbaAccreditedProgramId is provided
      const filteredTasks = nbaAccreditedProgramId
        ? contributorTasks.filter(task => String(task.cycle_category?.cycle?.program?.program_id) === String(nbaAccreditedProgramId))
        : contributorTasks;

      console.log("Filtered tasks for program:", nbaAccreditedProgramId, filteredTasks);

      // Process data for dashboard using the new API structure
      let pending = 0, approved = 0, rejected = 0, submitted = 0, draft = 0;
      
      const processedTasks = filteredTasks.map(task => {
        // Use current_status from the new API structure
        const currentStatus = task.current_status || task.status || 'ASSIGNED';
        let displayStatus = 'DRAFT';
        
        // Map current_status to display categories
        switch (currentStatus) {
          case 'PENDING':
          case 'PENDING_REVIEW':
            displayStatus = 'PENDING';
            pending++;
            break;
          case 'APPROVED':
          case 'APPROVED_BY_COORDINATOR':
          case 'APPROVED_BY_SUB_COORDINATOR':
            displayStatus = 'APPROVED';
            approved++;
            break;
          case 'REJECTED':
          case 'REJECTED_BY_COORDINATOR':
          case 'REJECTED_BY_SUB_COORDINATOR':
            displayStatus = 'REJECTED';
            rejected++;
            break;
          case 'SUBMITTED':
          case 'SUBMITTED_BY_CONTRIBUTOR':
            displayStatus = 'SUBMITTED';
            submitted++;
            break;
          case 'ASSIGNED':
          case 'IN_PROGRESS':
          default:
            displayStatus = 'DRAFT';
            draft++;
        }

        return {
          id: task.cycle_sub_category?.id || task.allocation_id,
          allocationId: task.allocation_id,
          criteriaName:  task.cycle_sub_category?.sub_category_name || 'Unknown Section',
          status: displayStatus,
          currentStatus: currentStatus,
          hasData: task.is_active || false,
          submittedTime: task.updateddate,
          contributorId: task.contributor?.other_staff_id,
          contributorName: task.contributor ? `${task.contributor.firstname} ${task.contributor.lastname}` : 'Unknown',
          assignedByName: task.assigned_by ? `${task.assigned_by.firstname} ${task.assigned_by.lastname}` : 'Unknown',
          cycleName:task?.cycle_category?.cycle?.program?.program_name +' > '+ task.cycle_category?.cycle?.cycle_name + ' > ' +  task.cycle_category?.cycle?.academic_year?.year  || 'Unknown Cycle',
          cycleCategoryName: task.cycle_category?.category_name || 'Unknown Category',
          remarks: task.remarks,
          createdDate: task.createddate,
          // Include the complete task object for navigation
          cycle_category: task.cycle_category,
          cycle_sub_category: task.cycle_sub_category
        };
      });

      console.log("Processed tasks with new API structure:", processedTasks);

      setDashboardData({
        totalTasks: filteredTasks.length,
        pending,
        approved,
        rejected,
        submitted,
        draft,
        tasks: processedTasks
      });

    } catch (error) {
      console.error("Error loading contributor dashboard:", error);
      // Set demo data on error
      setDashboardData({
        totalTasks: 8,
        pending: 3,
        approved: 2,
        rejected: 1,
        submitted: 1,
        draft: 1,
        tasks: [
          { id: 1, criteriaName: 'Criteria 9.2', status: 'PENDING', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
          { id: 2, criteriaName: 'Criteria 9.3', status: 'APPROVED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
          { id: 3, criteriaName: 'Criteria 9.4', status: 'DRAFT', hasData: false, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
          { id: 4, criteriaName: 'Criteria 9.5', status: 'SUBMITTED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
          { id: 5, criteriaName: 'Criteria 9.6', status: 'REJECTED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
          { id: 6, criteriaName: 'Criteria 9.7', status: 'PENDING', hasData: false, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
          { id: 7, criteriaName: 'Criteria 9.8', status: 'PENDING', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } },
          { id: 8, criteriaName: 'Criteria 9.9', status: 'APPROVED', hasData: true, cycle_category: { cycle: { id: nbaAccreditedProgramId } } }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Pie chart data for custom component
  const pieChartData = [
    {
      label: 'Pending',
      value: dashboardData.pending,
      color: '#F59E0B',
      status: 'PENDING'
    },
    {
      label: 'Approved',
      value: dashboardData.approved,
      color: '#10B981',
      status: 'APPROVED'
    },
    {
      label: 'Rejected',
      value: dashboardData.rejected,
      color: '#EF4444',
      status: 'REJECTED'
    },
    {
      label: 'Submitted',
      value: dashboardData.submitted,
      color: '#3B82F6',
      status: 'SUBMITTED'
    },
    {
      label: 'Draft',
      value: dashboardData.draft,
      color: '#6B7280',
      status: 'DRAFT'
    }
  ].filter(item => item.value > 0); // Only show segments with data

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    
    let filtered = [];
    switch (status) {
      case 'PENDING':
        filtered = dashboardData.tasks.filter(task => task.status === 'PENDING');
        break;
      case 'APPROVED':
        filtered = dashboardData.tasks.filter(task => task.status === 'APPROVED');
        break;
      case 'REJECTED':
        filtered = dashboardData.tasks.filter(task => task.status === 'REJECTED');
        break;
      case 'SUBMITTED':
        filtered = dashboardData.tasks.filter(task => task.status === 'SUBMITTED');
        break;
      case 'DRAFT':
        filtered = dashboardData.tasks.filter(task => task.status === 'DRAFT');
        break;
      default:
        filtered = dashboardData.tasks;
    }
    
    setFilteredTasks(filtered);

    // Scroll to the tasks section with a smooth animation
    setTimeout(() => {
      tasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); // A small delay ensures the section is rendered before scrolling
  };

  const handleTaskClick = (task) => {
    console.log("Task clicked:", task); // Debug log
    
    try {
      // Use the same navigation logic as ViewNBADashboard.jsx handleTaskCardClick
      const cycleCategory = task.cycle_category;
      const cycleSubCategory = task.cycle_sub_category;

      if (!cycleCategory) {
        console.error("Missing cycle_category in task:", task);
        return;
      }

      // Get the cycle ID from the cycle_category.cycle.id (same as ViewNBADashboard)
      const cycleId = cycleCategory.cycle?.id;

      if (!cycleId) {
        console.error("Missing cycle ID in task data:", task);
        return;
      }

      // Get the category_name from the API response to determine which criteria to navigate to
      const categoryName = cycleCategory.category?.category_name ||
        cycleCategory.category_name || "";

      let criteriaRoute = "";
      console.log("🔍 Category Name from API:", categoryName);

      // Map category names to routes (same as ViewNBADashboard)
      const categoryRouteMap = {
        // Criterion 1 - Vision, Mission and Program Educational Objectives
        "Outcome-Based Curriculum": "/nba/criterion-1",
        "Vision Mission and Program Educational Objectives": "/nba/criterion-1",
        "Outcome-based Curriculum": "/nba/criterion-1",

        // Criterion 2 - Teaching-learning and Evaluation
        "Program Curriculum and Teaching - Learning Processes": "/nba/criterion-2",

        // Criterion 3 - Research, Innovations and Extension
        "Course Outcomes and Program Outcomes": "/nba/criterion-3",

        // Criterion 4 - Students' Performance
        "Student's Performance": "/nba/criterion-4",

        // Criterion 5 - Student Support and Progression
        "Faculty Information": "/nba/criterion-5",

        // Criterion 6 - Governance, Leadership and Management
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
        "Student Support Systems": "/nba/criterion-8",

        // Criterion 9 - Quality in Research
        "Governance, Institutional Support and Financial Resources": "/nba/criterion-9"
      };

      // Find matching route
      criteriaRoute = categoryRouteMap[categoryName];

      if (!criteriaRoute) {
        // Fallback: try partial matching (same as ViewNBADashboard)
        const categoryLower = categoryName.toLowerCase();
        if (categoryLower.includes("vision") || categoryLower.includes("mission") || categoryLower.includes("curriculum")) {
          criteriaRoute = "/nba/criterion-1";
        } else if (categoryLower.includes("teaching") || categoryLower.includes("evaluation")) {
          criteriaRoute = "/nba/criterion-2";
        } else if (categoryLower.includes("research") || categoryLower.includes("innovation")) {
          criteriaRoute = "/nba/criterion-3";
        } else if (categoryLower.includes("learning resources") || categoryLower.includes("students' performance") || categoryLower.includes("students’ performance")) {
          criteriaRoute = "/nba/criterion-4";
        } else if (categoryLower.includes("student support") && !categoryLower.includes("governance")) {
          criteriaRoute = "/nba/criterion-5";
        } else if (categoryLower.includes("faculty") || categoryLower.includes("contributions") || categoryLower.includes("leadership") || categoryLower.includes("management")) {
          criteriaRoute = "/nba/criterion-6";
        } else if (categoryLower.includes("facilities") || categoryLower.includes("technical support")) {
          criteriaRoute = "/nba/criterion-7";
        } else if (categoryLower.includes("Student Support Systems")) {
          criteriaRoute = "/nba/criterion-8";
        } else if (categoryLower.includes("quality") && categoryLower.includes("research")) {
          criteriaRoute = "/nba/criterion-9";
        } else {
          console.warn("⚠️ No matching route found for category:", categoryName);
          return;
        }
      }

      // Create navigation state (same structure as ViewNBADashboard)
      const navigationState = {
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
 
      console.log("🔍 CONTRIBUTOR DASHBOARD NAVIGATION DEBUG:");
      console.log("Category name:", categoryName);
      console.log("Determined criteria route:", criteriaRoute);
      console.log("Navigation state:", navigationState);

      // Validate that we have all required IDs
      if (!navigationState.nba_accredited_program_id || !navigationState.nba_criteria_id || !navigationState.nba_criteria_sub_level1_id) {
        console.error("Missing required navigation parameters:", navigationState);
        return;
      }

      // Navigate to the appropriate criteria component
      navigate(criteriaRoute, { state: navigationState });


    } catch (error) {
      console.error("Error navigating to criteria:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
      case 'APPROVED_BY_COORDINATOR':
      case 'APPROVED_BY_SUB_COORDINATOR': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
      case 'REJECTED_BY_COORDINATOR':
      case 'REJECTED_BY_SUB_COORDINATOR': return 'bg-red-100 text-red-800 border-red-200';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'APPROVED_BY_COORDINATOR': return 'Approved';
      case 'APPROVED_BY_SUB_COORDINATOR': return 'Approved';
      case 'REJECTED_BY_COORDINATOR': return 'Rejected';
      case 'REJECTED_BY_SUB_COORDINATOR': return 'Rejected';
      case 'PENDING': return 'Pending Review';
      case 'SUBMITTED': return 'Submitted';
      default: return 'Draft';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Main Chart Section - Full Width and Large */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-indigo-100 relative overflow-hidden">
          {/* Enhanced Background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-20 translate-x-20 opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-100 to-orange-100 rounded-full translate-y-16 -translate-x-16 opacity-40"></div>
          <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-x-12 opacity-30"></div>
          <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-pink-100 to-red-100 rounded-full opacity-25"></div>

          <div className="relative z-10">
            {/* Large Chart Container */}
            <div className="py-8">
              <div className="transform hover:scale-105 transition-all duration-500">
                <CustomPieChart
                  data={pieChartData}
                  onSegmentClick={handleStatusClick}
                />
              </div>
            </div> 
          </div>
        </div>

      {/* Filtered Tasks */}
      {selectedStatus && filteredTasks.length > 0 && (
        <div ref={tasksRef} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1).toLowerCase()} Tasks
            </h3>
            <button
              onClick={() => {
                setSelectedStatus(null);
                setFilteredTasks([]); // This will hide the section
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          
          <div className="grid gap-4">
           {filteredTasks.map((task, index) => (
             <div
               key={index}
               onClick={() => handleTaskClick(task)}
               className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all duration-200 hover:border-indigo-300"
             >
               <div className="flex items-center justify-between">
                 <div className="flex-1">
                   <div className="flex items-start justify-between mb-3">
                     <div>
                       <h4 className="font-semibold text-gray-900 mb-1">{task.criteriaName}</h4>
                       {task.cycleCategoryName && (
                         <p className="text-sm text-indigo-600">
                           <i className="fas fa-folder mr-1"></i>
                           {task.cycleCategoryName}
                         </p>
                       )}
                     </div>
                     <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                       {getStatusDisplayText(task.status)}
                     </span>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                     {task.cycleName && (
                       <div className="flex items-center gap-2">
                         <i className="fas fa-sync-alt text-blue-500"></i>
                         <span className="text-gray-600">{task.cycleName}</span>
                       </div>
                     )}
                     {task.assignedByName && (
                       <div className="flex items-center gap-2">
                         <i className="fas fa-user text-green-500"></i>
                         <span className="text-gray-600">Assigned By : {task.assignedByName}</span>
                       </div>
                     )}
                     {task.createdDate && (
                       <div className="flex items-center gap-2">
                         <i className="fas fa-calendar text-purple-500"></i>
                         <span className="text-gray-600">
                          Assigned Date : {new Date(task.createdDate).toLocaleDateString("en-GB")}
                         </span>
                       </div>
                     )}
                     {task.currentStatus && task.currentStatus !== task.status && (
                       <div className="flex items-center gap-2">
                         <i className="fas fa-info-circle text-blue-500"></i>
                         <span className="text-gray-600 text-xs">
                           {task.currentStatus.replace(/_/g, ' ')}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
                 
                 <div className="ml-4 flex items-center">
                   <i className="fas fa-chevron-right text-gray-400"></i>
                 </div>
               </div>
             </div>
           ))}
         </div>
        </div>
      )}

      {/* All Tasks */}
      {!selectedStatus && (
        <div ref={tasksRef} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <i className="fas fa-list-check text-indigo-600"></i>
              All Your Tasks
            </h3>
            <div className="text-sm text-gray-500">
              {dashboardData.totalTasks} task{dashboardData.totalTasks !== 1 ? 's' : ''} assigned
            </div>
          </div>
          
          <div className="grid gap-4">
            {dashboardData.tasks.map((task, index) => (
              <div
                key={index}
                onClick={() => handleTaskClick(task)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all duration-200 hover:border-indigo-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{task.criteriaName}</h4>
                        {task.cycleCategoryName && (
                          <p className="text-sm text-indigo-600">
                            <i className="fas fa-folder mr-1"></i>
                            {task.cycleCategoryName}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusDisplayText(task.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {task.cycleName && (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-sync-alt text-blue-500"></i>
                          <span className="text-gray-600">{task.cycleName}</span>
                        </div>
                      )}
                      {task.assignedByName && (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-user text-green-500"></i>
                          <span className="text-gray-600">Assigned By : {task.assignedByName}</span>
                        </div>
                      )}
                      {task.createdDate && (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-calendar text-purple-500"></i>
                          <span className="text-gray-600">
                           Assigned Date : {new Date(task.createdDate).toLocaleDateString("en-GB")}

                          </span>
                        </div>
                      )}
                      {task.currentStatus && task.currentStatus !== task.status && (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-info-circle text-blue-500"></i>
                          <span className="text-gray-600 text-xs">
                            {task.currentStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center">
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ContributorDashboard;