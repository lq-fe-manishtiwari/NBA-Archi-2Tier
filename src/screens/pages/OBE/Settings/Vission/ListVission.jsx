import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { VisionService } from "../Services/vision.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { Edit, ChevronDown, Plus } from 'lucide-react';

const ListVision = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [visionData, setVisionData] = useState([]);
  const [allVisionData, setAllVisionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = visionData.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages
  const totalPages = Math.ceil(visionData.length / itemsPerPage);

  // Page handlers
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  useEffect(() => {
    fetchPrograms();
    fetchAllVision();
  }, []);

// Load stored program AFTER programs are fetched
useEffect(() => {
  const storedProgram = localStorage.getItem("selectedOBEprogram");

  if (storedProgram && programs.length > 0) {
    const programId = Number(storedProgram);  // convert to number
    setSelectedProgramId(programId);
    onProgramChange(programId);
  }
}, [programs]);   // wait until programs are loaded


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await collegeService.getAllprogram();
      setPrograms(data);
    } catch (err) {
      setError("Failed to fetch programs. Please try again later.");
      console.error("Failed to fetch programs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVision = async () => {
    try {
      setLoading(true);
      const data = await VisionService.getAllVision();
      setAllVisionData(data);
      setVisionData(data); // display all data initially
    } catch (err) {
      console.error("Failed to fetch vision data:", err);
      setError("Failed to fetch vision data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onProgramChange = async (program_id) => {
    setSelectedProgramId(program_id);
    setIsDropdownOpen(false);

    if (!program_id) {
      setVisionData(allVisionData);
      return;
    }

    try {
      setLoading(true);
      const response = await VisionService.getVisionByProgramId(program_id);
      setVisionData(response);
    } catch (err) {
      console.error("Error fetching vision by program:", err);
      setVisionData([]);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProgramName = () => {
    if (!selectedProgramId) return "Select Program";
    const program = programs.find(p => p.program_id === selectedProgramId);
    return program?.program_name || "Select Program";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="pageheading text-xl font-semibold">Vision List</h2>
        <Link to="/obe/settings/Add_VISION">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
            <Plus className="w-4 h-4" />
            <span>Add Vision</span>
          </button>
        </Link>
      </div>

      {/* Program Dropdown */}
      <div className="mb-6 w-64" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Program
        </label>
        <div className="relative">
          <div
            className="w-full px-3 py-2 border bg-white border-gray-300 cursor-pointer hover:border-blue-400 rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={selectedProgramId ? 'text-gray-900' : 'text-gray-400'}>
              {getSelectedProgramName()}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => onProgramChange("")}
              >
                Select Program
              </div>
              {programs.map((p) => (
                <div
                  key={p.program_id}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => onProgramChange(p.program_id)}
                >
                  {p.program_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : visionData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="table-header">
                <tr>
                  <th className="table-th text-center" style={{width: '10%'}}>Sr.No</th>
                  <th className="table-th text-center" style={{width: '20%'}}>Program Name</th>
                  <th className="table-th text-center" style={{width: '15%'}}>Vision Code</th>
                  <th className="table-th text-center" style={{width: '45%'}}>Vision Statement</th>
                  <th className="table-th text-center" style={{width: '10%'}}>Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-4 text-center text-sm text-gray-900">{indexOfFirstItem + index + 1}</td>
                    <td className="px-3 py-4 text-center text-sm text-gray-900">{item.program?.program_name}</td>
                    <td className="px-3 py-4 text-center text-sm text-gray-900">{item.vision_code}</td>
                    <td className="px-3 py-4 text-center text-sm text-gray-900">{item.vision_statement}</td>
                    <td className="px-2 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to="/obe/settings/Add_VISION"
                          state={{
                            isEdit: true,
                            visionData: item
                          }}
                        >
                          <button className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, visionData.length)} of {visionData.length} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">
              {selectedProgramId ? 'No records found' : 'Please select a program'}
            </p>
            <p className="text-sm">
              {selectedProgramId 
                ? 'No vision data available for the selected program.' 
                : 'Select a program from the dropdown to view vision data.'}
            </p>
          </div>
        </div>
      )}
    </div>

  );
};

export default ListVision;
