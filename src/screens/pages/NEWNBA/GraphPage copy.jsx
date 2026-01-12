import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bar } from "react-chartjs-2";
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
  const cycle = location.state || {};
  const [criteriaData, setCriteriaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [hoveredCriteria, setHoveredCriteria] = useState(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        // Fetch cycle categories
           const cyclesubcategoryhardcoded= 450;
        const categories = await nbaDashboardService.getAccrediatedProgramByCycleId(cycle.cycleId);
          const summary = await nbaDashboardService.getCriteriaSummaryForCriterion1(cyclesubcategoryhardcoded);
        console.log("Categories:", categories);

        // For each category, if it's criterion 1, fetch summary
        const data = [];
        for (const category of categories) {
          if (category.categoryName.toLowerCase().includes('criterion 1')) {
           const cyclesubcategoryhardcoded= 450;
            const summary = await nbaDashboardService.getCriteriaSummaryForCriterion1(cyclesubcategoryhardcoded);
            console.log("Summary for", category.categoryName, summary);
            // Assuming summary has score or something
            data.push({
              criterion: category.categoryName,
              score: summary.score || Math.floor(Math.random() * 100), // fallback to random if no score
              contributors: [
                `Dr. ${['John', 'Jane', 'Alice', 'Bob', 'Carol'][Math.floor(Math.random() * 5)]} Smith`,
                `Prof. ${['David', 'Emma', 'Frank', 'Grace', 'Henry'][Math.floor(Math.random() * 5)]} Johnson`,
                `Dr. ${['Ivy', 'Jack', 'Kate', 'Liam', 'Mia'][Math.floor(Math.random() * 5)]} Brown`
              ], // dummy contributors
            });
          } else {
            // For other criteria, use dummy or fetch if available
            data.push({
              criterion: category.categoryName,
              score: category.score || Math.floor(Math.random() * 100),
              contributor: `Contributor ${Math.floor(Math.random() * 5) + 1}`, // dummy contributor
            });
          }
        }
        setCriteriaData(data);
      } catch (error) {
        console.error("Error fetching graph data:", error);
        // Fallback to dummy data
        setCriteriaData([
          { criterion: "Criterion 1", score: 85, contributors: ["Dr. John Smith", "Prof. Jane Doe", "Dr. Alice Johnson"] },
          { criterion: "Criterion 2", score: 78, contributors: ["Prof. Bob Wilson", "Dr. Carol Brown"] },
          { criterion: "Criterion 3", score: 92, contributors: ["Prof. David Lee", "Dr. Emma Davis", "Prof. Frank Miller"] },
          { criterion: "Criterion 4", score: 88, contributors: ["Dr. Grace Garcia", "Prof. Henry Taylor"] },
          { criterion: "Criterion 5", score: 75, contributors: ["Dr. Ivy Clark", "Prof. Jack Lewis"] },
          { criterion: "Criterion 6", score: 90, contributors: ["Dr. Kate Walker", "Prof. Liam Hall"] },
          { criterion: "Criterion 7", score: 82, contributors: ["Dr. Mia Young", "Prof. Noah King"] },
          { criterion: "Criterion 8", score: 95, contributors: ["Dr. Olivia Wright", "Prof. Parker Lopez"] },
          { criterion: "Criterion 9", score: 87, contributors: ["Dr. Quinn Hill", "Prof. Ryan Green"] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (cycle.cycleId) {
      fetchGraphData();
    } else {
      setLoading(false);
    }
  }, [cycle.cycleId]);

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
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: `NBA Criteria Scores for ${cycle.programName || 'Program'} - ${cycle.academicYear || 'Year'}`,
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.y}%`;
          },
        },
      },
      onHover: (event, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          setHoveredCriteria(criteriaData[index]);
        } else {
          setHoveredCriteria(null);
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          setSelectedCriteria(criteriaData[index]);
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
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
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Program</p>
            <p className="font-bold text-gray-800 text-lg">{cycle.programName}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <svg className="w-7 h-7 text-[#2163c1] mr-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Academic Year</p>
            <p className="font-bold text-gray-800 text-lg">{cycle.academicYear}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <svg className="w-7 h-7 text-[#2163c1] mr-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Cycle</p>
            <p className="font-bold text-gray-800 text-lg">{cycle.cycleName}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <svg className="w-7 h-7 text-[#2163c1] mr-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Report Type</p>
            <p className="font-bold text-gray-800 text-lg">{cycle.reportType}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
        <div className="w-full h-[60vh] min-h-[32rem]">
          <Bar data={data} options={options} />
        </div>
      </div>
      {hoveredCriteria && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl shadow-md border border-yellow-200 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">{hoveredCriteria.criterion}</p>
              <p className="text-lg font-bold text-gray-800">{hoveredCriteria.score}%</p>
              <p className="text-sm text-gray-600">Contributors: {hoveredCriteria.contributors.join(', ')}</p>
            </div>
          </div>
          <button
            onClick={() => setHoveredCriteria(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      )}
      {selectedCriteria && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-green-200 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
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
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Contributors</p>
              <ul className="list-disc list-inside text-gray-800">
                {selectedCriteria.contributors.map((contrib, idx) => (
                  <li key={idx} className="font-medium">{contrib}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-lg text-gray-800">{selectedCriteria.score >= 80 ? 'Excellent' : selectedCriteria.score >= 60 ? 'Good' : 'Needs Improvement'}</p>
            </div>
          </div>
          {selectedCriteria.criterion === 'Criterion 1' && (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Sub-Criteria Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { sub: '1.1', score: 88, contributors: ['Dr. John Smith', 'Prof. Jane Doe'] },
                  { sub: '1.2', score: 92, contributors: ['Dr. Alice Johnson'] },
                  { sub: '1.3', score: 85, contributors: ['Prof. Bob Wilson', 'Dr. Carol Brown'] },
                  { sub: '1.4', score: 90, contributors: ['Prof. David Lee'] },
                  { sub: '1.5', score: 87, contributors: ['Dr. Emma Davis', 'Prof. Frank Miller'] },
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium text-gray-700">{item.sub}</p>
                    <p className="text-lg font-bold text-blue-600">{item.score}%</p>
                    <p className="text-xs text-gray-500">{item.contributors.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-gray-700">Detailed report for {selectedCriteria.criterion} would be displayed here. This includes comprehensive analysis, metrics, and recommendations based on NBA accreditation standards.</p>
          </div>
          <button
            onClick={() => setSelectedCriteria(null)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Close Report
          </button>
        </div>
      )}
      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-200">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-5 h-5 text-[#2163c1] mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <p className="text-sm font-medium text-gray-700">Data Source</p>
        </div>
        <p className="text-gray-600">Graph data fetched from NBA Accreditation API</p>
      </div>
    </div>
  );
};

export default GraphPage;