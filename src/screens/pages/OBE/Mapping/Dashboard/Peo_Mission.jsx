import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MappingService } from "../../Services/mapping.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { Edit, Trash2, Eye, X } from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";

const Peo_Mission = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [missionData, setMissionData] = useState([]);
  const [allMissionData, setAllMissionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
  
    // Calculate current page data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = missionData.slice(indexOfFirstItem, indexOfLastItem);
  
    // Total pages
    const totalPages = Math.ceil(missionData.length / itemsPerPage);
  
    // Page handlers
    const handleNext = () => {
      if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };
  
    const handlePrev = () => {
      if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

  useEffect(() => {
    fetchPrograms();
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

    // Load stored program AFTER programs are fetched
    useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");
  
    if (storedProgram && programs.length > 0) {
      setSelectedProgramId(storedProgram); 
      onProgramChange(storedProgram);  
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programs]);

  const onProgramChange = async (program_id) => {
    setSelectedProgramId(program_id);
    localStorage.setItem("selectedOBEprogram", program_id);

    if (!program_id) {
      // if no program selected, show all visions
      setMissionData(allMissionData);
      return;
    }
    try {
      setLoading(true);
      // Call API to get filtered vision data by program_id
      const response = await MappingService.getPEOMissionMapping(program_id);
      setMissionData(response);
    } catch (err) {
      console.error("Error fetching vision by program:", err);
      setMissionData([]);
    } finally {
      setLoading(false);
    }
  };


  const HandleDelete = (MissionId) => {
      const item = missionData.find(m => m.mission_id === MissionId);
      setAlert(
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, delete!"
          cancelBtnText="Cancel"
          title="Are you sure?"
          onConfirm={() => confirmDelete(MissionId)}
          onCancel={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
        >
          Delete Mission for <strong>{item?.mission_code}</strong>?
        </SweetAlert>
      );
    };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="pageheading text-xl font-semibold">PEO-MISSION Mapping List</h2>
        <Link
          to="/obe/Mapping/Add-PEO-MISSION"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm"
        >
          Add PEO-MISSION Mapping
        </Link>
      </div>

      {/* Program Dropdown */}
      <div className="mb-6 w-64">
        <label className="block font-medium mb-1">
          Program
        </label>

        <select
          className="w-full border border-gray-300 rounded p-2"
          value={selectedProgramId}
          onChange={(e) => onProgramChange(e.target.value)}
        >
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.program_id} value={p.program_id}>
              {p.program_name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : missionData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Sr.No</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">PEO Code</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">PEO Statement</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Mission Code</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Mission Statement</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Correlation Level</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Action</th>
              </tr>
            </thead>

            <tbody>
  {currentItems.map((item, index) => (
    <tr key={item.id} className="border-t hover:bg-gray-50">
      <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
      <td className="px-4 py-2">{item.peo_name}</td> {/* PEO Code */}
      <td className="px-4 py-2">{item.peo_statement}</td> {/* PEO Statement */}
      <td className="px-4 py-2">{item.mission_name}</td> {/* Mission Code */}
      <td className="px-4 py-2">{item.mission_statement}</td> {/* Mission Statement */}
      <td className="px-4 py-2 text-center">{item.correlation_level}</td> {/* Correlation Level */}
      <td className="px-4 py-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Link
            to="/obe/settings/Add_MISSION"
            state={{
              isEdit: true,
              missionData: item
            }}
          >
            <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
              <Edit className="w-4 h-4" />
            </button>
          </Link>
          {/* Delete button if needed */}
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>

          <div className="flex items-center justify-between mt-4 w-full">
            {/* LEFT - Previous */}
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300`}
            >
              Previous
            </button>
            {/* CENTER - Entries info */}
            <div className="text-gray-600 text-sm">
              Showing {indexOfFirstItem + 1}–
              {Math.min(indexOfLastItem, missionData.length)} of {missionData.length} entries
            </div>
            {/* RIGHT - Next */}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300`}
            >
              Next
            </button>          
          </div>

        </div>
      ) : selectedProgramId ? (
        <p className="text-center py-6 text-gray-500">
          No records found.
        </p>
      ) : (
        <p className="text-center py-6 text-gray-500">
          Please select a program.
        </p>
      )}
      {alert}
    </div>

  );
};

export default Peo_Mission;
