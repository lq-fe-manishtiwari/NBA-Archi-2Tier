import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SetTargetAttainment from "./SetTargetAttainment";
import BulkUploadIndirect from "./BulkUploadIndirect";

import { collegeService } from "../../../Academics/Services/college.service.js";
import { AcademicService } from "../../../Academics/Services/Academic.service.js";
import { AttainmentConfigService } from "../../Services/attainment-config.service.js";

const Indirect = () => {
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [attainmentData, setAttainmentData] = useState([]);
  const [meanLevel, setMeanLevel] = useState(null);
  const [values, setValues] = useState({ program_id: "", academic_year_id: "" });
  const [loading, setLoading] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = attainmentData.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages
  const totalPages = Math.ceil(attainmentData.length / itemsPerPage);

  // Page handlers
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  useEffect(() => {
  setCurrentPage(1);
}, [attainmentData]);

  useEffect(() => {
    fetchPrograms();
    fetchAcademicYears();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await collegeService.getAllprogram();
      setPrograms(data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  // Load stored program AFTER programs are fetched
  useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");

    if (storedProgram && programs.length > 0) {
      setValues((prev) => ({ ...prev, program_id: storedProgram }));
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programs]);

  const fetchAcademicYears = async () => {
    try {
      const response = await AcademicService.getAcademic();
      setAcademicYears(response || []);
    } catch (err) {
      console.error("Failed to fetch academic years:", err);
    }
  };

  useEffect(() => {
    const fetchAttainmentData = async () => {
      if (values.program_id && values.academic_year_id) {
        setLoading(true);
        try {
          const response = await AttainmentConfigService.getSurveyAttainment(values.program_id, values.academic_year_id);
          setAttainmentData(response?.results || []);
          setMeanLevel(response?.mean_attainment_level || null);
        } catch (err) {
          console.error("Failed to fetch attainment data:", err);
          setAttainmentData([]);
          setMeanLevel(null);
        } finally {
          setLoading(false);
        }
      } else {
        setAttainmentData([]);
        setMeanLevel(null);
      }
    };

    fetchAttainmentData();
  }, [values.program_id, values.academic_year_id]);



  return (
    <div className="p-6">
      <h2 className="pageheading text-xl font-semibold mb-4">Attainment Marks Entry</h2>

      <div className="flex justify-between items-start mb-6">
        {/* Left side */}
        <div>
          <SetTargetAttainment />
        </div>

        {/* Right side */}
        <div>
          <BulkUploadIndirect />
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Program */}
        <div className="w-full">
          <label className="block font-semibold mb-1">Program</label>
          <select
            value={values.program_id}
            onChange={(e) => setValues({ program_id: e.target.value, academic_year_id: "" })}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select Program</option>
            {programs.map((p) => (
              <option key={p.program_id} value={p.program_id}>
                {p.program_name}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div className="w-full">
          <label className="block font-semibold mb-1">Academic Year</label>
          <select
            value={values.academic_year_id}
            onChange={(e) => setValues((prev) => ({ ...prev, academic_year_id: e.target.value }))}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.year}
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* Table & Mean Attainment */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading data...</p>
        </div>
      ) : attainmentData.length > 0 ? (
        <>
          {meanLevel !== null && (
            <div className="mb-2 text-left">
              <strong>Mean Attainment Level:</strong> {meanLevel}
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-white text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No</th>
                    <th className="px-6 py-3 text-left text-white text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                    <th className="px-6 py-3 text-left text-white text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                    <th className="px-6 py-3 text-left text-white text-xs font-medium text-gray-500 uppercase tracking-wider">Students ≥ Average</th>
                    <th className="px-6 py-3 text-left text-white text-xs font-medium text-gray-500 uppercase tracking-wider">% Students</th>
                    <th className="px-6 py-3 text-left text-white text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-white text-xs font-medium text-gray-500 uppercase tracking-wider">Attainment Level</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{indexOfFirstItem + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.average ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.total_students ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.students_above_or_equal_average ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.percent_students ? `${item.percent_students}%` : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.target ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.attainment_level >= 3 ? 'bg-green-100 text-green-800' :
                            item.attainment_level >= 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {item.attainment_level ?? "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
              Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, attainmentData.length)} of {attainmentData.length} entries
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
          </div>
        </>
      ) : (
        <div className="text-center p-4">
          {values.academic_year_id
            ? "No Data Found"
            : "Please select program and academic year to view data"}
        </div>
      )}
    </div>

  );
};

export default Indirect;
