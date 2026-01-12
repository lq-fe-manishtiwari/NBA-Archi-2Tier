import React, { useState, useEffect } from "react";
import { collegeService } from "../../Academics/Services/college.service.js";
import { MarksEntryService } from "../Services/marks-entry.service.js";

const Dashboard = ({ onSettingsChange }) => {
  const [programs, setPrograms] = useState([]);
  const [directAttainmentData, setDirectAttainmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [selectedProgram, setSelectedProgram] = useState([]);

  // Notify parent whenever selectedProgram changes
useEffect(() => {
  if (selectedProgram) {
    localStorage.setItem("selectedOBEprogram", selectedProgram);
    console.log("program saved in local storage", selectedProgram);
  } else {
    localStorage.removeItem("selectedOBEprogram");
  }

  if (onSettingsChange) {
    onSettingsChange({ program_id: selectedProgram });
  }
}, [selectedProgram, onSettingsChange]);


  // Fetch all programs on mount 
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const data = await collegeService.getAllprogram();
        setPrograms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
        setPrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch Direct Attainment Data when program changes
  const fetchDirectAttainmentData = async (programId) => {
    if (!programId) {
      setDirectAttainmentData([]);
      return;
    }

    setLoading(true);
    try {
      const data = await MarksEntryService.getDirectAttainmentByProgram(programId);
      setDirectAttainmentData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching direct attainment data:", error);
      setDirectAttainmentData([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger when selected program changes
  useEffect(() => {
    if (selectedProgram) {
      fetchDirectAttainmentData(selectedProgram);
    } else {
      setDirectAttainmentData([]);
    }
  }, [selectedProgram]);

  // Optional: Notify parent component
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({ program_id: selectedProgram });
    }
  }, [selectedProgram, onSettingsChange]);

  // Loading state for programs
  if (loadingPrograms) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">Loading programs...</div>
      </div>
    );
  }

  const selectedProgramObj = programs.find(p => p.program_id == selectedProgram);

  return (
    <div className="p-6">
      {/* <div className="p-6 max-w-7xl mx-auto"> */}
      <h2 className="text-2xl font-bold text-primary-600 mb-6">
        Dashboard
      </h2>

      {/* Program Selector */}
      <div className="mb-8 max-w-md">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Program
        </label>
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">-- Choose a Program --</option>
          {programs.map((p) => (
            <option key={p.program_id} value={p.program_id}>
              {p.program_name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Data Indicator */}
      {loading && selectedProgram && (
        <div className="text-center py-8">
          <div className="text-blue-600 font-medium">
            Loading direct attainment data...
          </div>
        </div>
      )}

      {/* Attainment Table */}
      {selectedProgram && !loading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 bg-primary-600 border-b border-gray-200">
            {selectedProgramObj && (
              <h3 className="text-xl font-semibold text-white">
                {selectedProgramObj.program_name}
              </h3>
            )}
          </div>

          <div className="p-6">
            {directAttainmentData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-primary-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Course Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Course Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        CO Attainment Avg
                      </th>
                      {(() => {
                        const poKeys = Array.from(
                          new Set(directAttainmentData.flatMap((d) => Object.keys(d.po_averages || {})))
                        );
                        const psoKeys = Array.from(
                          new Set(directAttainmentData.flatMap((d) => Object.keys(d.pso_averages || {})))
                        );
                        return (
                          <>
                            {poKeys.map((po) => (
                              <th key={po} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                {po}
                              </th>
                            ))}
                            {psoKeys.map((pso) => (
                              <th key={pso} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                {pso}
                              </th>
                            ))}
                          </>
                        );
                      })()}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {directAttainmentData.map((item, index) => {
                      const poKeys = Array.from(
                        new Set(directAttainmentData.flatMap((d) => Object.keys(d.po_averages || {})))
                      );
                      const psoKeys = Array.from(
                        new Set(directAttainmentData.flatMap((d) => Object.keys(d.pso_averages || {})))
                      );

                      return (
                        <tr key={index} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.course_code || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.course_name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.co_attainment_avg || "0"}
                          </td>
                          {poKeys.map((po) => (
                            <td key={po} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.po_averages[po] ? (
                                <div className="flex flex-col items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div
                                      className={`h-2 rounded-full ${item.po_averages[po] >= 2.5 ? 'bg-green-500' :
                                          item.po_averages[po] >= 1.5 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                      style={{ width: `${(item.po_averages[po] / 3) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium">{item.po_averages[po]}</span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                          ))}
                          {psoKeys.map((pso) => (
                            <td key={pso} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.pso_averages[pso] ? (
                                <div className="flex flex-col items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div
                                      className={`h-2 rounded-full ${item.pso_averages[pso] >= 2.5 ? 'bg-green-500' :
                                          item.pso_averages[pso] >= 1.5 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                      style={{ width: `${(item.pso_averages[pso] / 3) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium">{item.pso_averages[pso]}</span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-white">
                No direct attainment data available for this program.
              </div>
            )}
          </div>
        </div>
      )}

      {/* No program selected */}
      {!selectedProgram && programs.length > 0 && (
        <div className="text-center py-16 text-white">
          <p className="text-lg">Please select a program to view OBE Direct Attainment data.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;