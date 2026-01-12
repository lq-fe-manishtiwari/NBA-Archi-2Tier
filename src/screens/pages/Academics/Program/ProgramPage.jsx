import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2, Eye, X } from 'lucide-react';
import { collegeService } from "../Services/college.service";
import { allocationService } from "../Services/Allocation.service";
import BulkUploadProgram from "./BulkUploadProgram";
import SearchBar from "../../../../Components/SearchBar";
import ViewToggle from "../Components/ViewToggle";
import  {useViewMode}  from "../../../../contexts/ViewModeContext";

export default function ProgramPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { globalViewMode } = useViewMode();
  const [viewMode, setViewMode] = useState(globalViewMode);
  const [showAlert, setShowAlert] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(null);
  
  // View Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Update local viewMode when global changes
  useEffect(() => {
    setViewMode(globalViewMode);
  }, [globalViewMode]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await collegeService.getAllprogram();
      setPrograms(data);
      setFilteredPrograms(data);
    } catch (err) {
      setError("Failed to fetch programs. Please try again later.");
      console.error("Failed to fetch programs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter programs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPrograms(programs);
    } else {
      const filtered = programs.filter((program) =>
        program.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.program_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPrograms(filtered);
    }
  }, [searchTerm, programs]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleDeleteClick = (program) => {
    setSelectedProgram(program);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProgram) return;
    setIsDeleting(true);
    try {
      await collegeService.DeleteprogrambyID(selectedProgram.program_id);
      setPrograms(prev => prev.filter(p => p.program_id !== selectedProgram.program_id));
      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Program has been deleted successfully.
        </SweetAlert>
      );
    } catch (err) {
      setError("Failed to delete program. Please try again.");
      console.error("Failed to delete program:", err);
    } finally {
      setIsDeleting(false);
      setShowAlert(false);
      setSelectedProgram(null);
    }
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setSelectedProgram(null);
  };

  // Handle View Program Allocation
  const handleViewProgram = async (program) => {
    setViewLoading(true);
    setShowViewModal(true);
    
    try {
      const [allocationData, subjects] = await Promise.all([
        allocationService.getProgramAllocatedDetailsbyProgramId(program.program_id),
        collegeService.getSUbjectbyProgramID(program.program_id),
      ]);
      
      setViewData({
        program,
        allocations: allocationData,
        subjects: subjects || [],
      });
    } catch (err) {
      console.error("Failed to fetch program details:", err);
      setError("Failed to load program details.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewData(null);
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUpload(false);
    fetchPrograms(); // Refresh the program list
    setAlert(
      <SweetAlert
        success
        title="Success!"
        onConfirm={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        Programs have been uploaded successfully.
      </SweetAlert>
    );
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading programs...</div>;
  }


  return (
    <div className="p-0 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        {/* Search Bar */}
        <div >
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search programs..."
            className="max-w-md"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
          >
            Bulk Upload
          </button>
          <button
            onClick={() => navigate("/academics/program/add")}
            className="bg-primary-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
          >
            + Add New Program
          </button>
        </div>
      </div>



      {/* Table View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Program Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {program.program_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {program.program_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/academics/program/allocate/${program.program_id}`)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm"
                          >
                            Allocate
                          </button>
                          <button
                            onClick={() => handleViewProgram(program)}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                            title="View Allocation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                            onClick={() => navigate(`/academics/program/edit/${program.program_id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(program)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `No programs found matching "${searchTerm}"` : "No programs found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{program.program_name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Code:</strong> {program.program_code}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                {/* Left side button */}
                <div>
                  <button onClick={() => navigate(`/academics/program/allocate/${program.program_id}`)}
                    className="p-2.5 w-32 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-200 transition"
                  >
                   Allocate
                  </button>
                </div>

                {/* Right side buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProgram(program)}
                    className="p-2.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                    title="View Allocation"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                    onClick={() => navigate(`/academics/program/edit/${program.program_id}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(program)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? `No programs found matching "${searchTerm}"` : "No programs found"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SweetAlert */}
      {showAlert && selectedProgram && (
        <SweetAlert
          warning
          showCancel
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          disabled={isDeleting}
          confirmBtnText="OK"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
        >
          Are you sure you want to delete {selectedProgram.program_name}?
        </SweetAlert>
      )}

      {showBulkUpload && (
        <BulkUploadProgram
          onClose={() => setShowBulkUpload(false)}
          onSuccess={handleBulkUploadSuccess}
        />
      )}

      {/* View Allocation Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewData?.program?.program_name} - Allocation Details
              </h2>
              <button
                onClick={handleCloseViewModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {viewLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
                </div>
              ) : viewData ? (
                <div className="space-y-6">
                  {/* Program Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Program Information</h3>
                    <p className="text-blue-800"><strong>Name:</strong> {viewData.program.program_name}</p>
                    <p className="text-blue-800"><strong>Code:</strong> {viewData.program.program_code}</p>
                  </div>

                  {/* Subjects */}
                  {viewData.subjects && viewData.subjects.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Subjects by Class Year</h3>
                      <div className="space-y-4">
                        {/* Group subjects by class year */}
                        {Object.entries(
                          viewData.subjects.reduce((acc, subject) => {
                            const classYearName = subject.class_year?.name || 'Not Assigned';
                            const classYearId = subject.class_year?.class_year_id || 'unassigned';
                            if (!acc[classYearId]) {
                              acc[classYearId] = {
                                name: classYearName,
                                yearNumber: subject.class_year?.year_number,
                                subjects: []
                              };
                            }
                            acc[classYearId].subjects.push(subject);
                            return acc;
                          }, {})
                        ).map(([classYearId, classYearData]) => (
                          <div key={classYearId} className="bg-white rounded-lg p-4 border border-green-300">
                            <h4 className="text-lg font-bold text-blue-700 mb-3">
                              {classYearData.name}
                              {classYearData.yearNumber && ` (Year ${classYearData.yearNumber})`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {classYearData.subjects.map((subject, idx) => (
                                <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                  <p className="font-medium text-gray-900">{subject.name}</p>
                                  <p className="text-sm text-gray-600">Code: {subject.subject_code}</p>
                                  {subject.paper_code && (
                                    <p className="text-sm text-gray-600">Paper: {subject.paper_code}</p>
                                  )}
                                  {subject.credits && (
                                    <p className="text-xs text-blue-600 mt-1">Credits: {subject.credits}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Class Allocations */}
                  {viewData.allocations?.class_years && viewData.allocations.class_years.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Allocations</h3>
                      <div className="space-y-6">
                        {viewData.allocations.class_years.map((classYear, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                            <h4 className="text-xl font-bold text-blue-700 mb-4">{classYear.class_year_name}</h4>
                            
                            {classYear.semester_divisions && classYear.semester_divisions.length > 0 ? (
                              <div className="space-y-4">
                                {classYear.semester_divisions.map((sem, semIdx) => (
                                  <div key={semIdx} className="bg-white rounded-lg border border-gray-300 p-4">
                                    <h5 className="font-bold text-gray-800 mb-3">Semester {sem.semester_number || sem.semester_id}</h5>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-gray-700">Division</th>
                                            <th className="px-4 py-2 text-left text-gray-700">Class Teacher</th>
                                            <th className="px-4 py-2 text-left text-gray-700">Student Limit</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          <tr>
                                            <td className="px-4 py-2">{sem.division_name || sem.division_id || 'N/A'}</td>
                                            <td className="px-4 py-2">{sem.teacher_name || 'Not assigned'}</td>
                                            <td className="px-4 py-2">{sem.student_limit || 'Not set'}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No semester divisions allocated</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p>No allocation details found for this program.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {alert}
    </div>
  );
}
