'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, ToggleLeft, ToggleRight, Eye, Edit, Trash2,
  Filter, X, ChevronDown
} from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import AllocateStudent from '../Components/AllocateStudent';
import { deleteStudent, changeStatus, softDeleteStudent } from '../Services/student.service.js';
import { client, nonAllocatedStudents as nonAllocatedStudentsQuery } from '../Services/graphql.service.js';
import { collegeService } from '../../Academics/Services/college.service';

export default function NonAllocatedStudent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPrograms, setAllPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [deleting, setDeleting] = useState(false); // Delete loading
  const [statusChanging, setStatusChanging] = useState({}); // Status toggle loading per student
  
  // Alert states for delete operation
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // New states for password-protected deletion
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');

  // === PROMOTION MODAL STATE ===
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionData, setPromotionData] = useState({
    program: '',
    class: '',
    batch: '',
    division: '',
    academicYear: ''
  });

  const batchOptions = ['2023-24', '2024-25', '2025-26'];

  const openPromotionModal = () => setShowPromotionModal(true);
  const closePromotionModal = () => {
    setShowPromotionModal(false);
    setPromotionData({ program: '', class: '', batch: '', division: '', academicYear: '' });
  };

  const handlePromote = () => {
    console.log('Promoting students:', selectedStudentIds);
    console.log('With data:', promotionData);
    closePromotionModal();
  };

  // Filter State
  const [filters, setFilters] = useState({
    program: [],
    classDataId: [],
    gradeDivisionId: [],
    activeInactiveStatus: 'all',
    filterOpen: false
  });

  // Pagination
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  /* --------------------------------------------------- */

  // Function to load/refresh students
  const loadStudents = async () => {
    try {
      setLoading(true);

      // Wait for selected program to be set
      if (!selectedProgramId) {
        setLoading(false);
        return;
      }

      // ---- Fetch non-allocated students for selected program only ---------
      const { data } = await client.query({
        query: nonAllocatedStudentsQuery,
        variables: { programId: String(selectedProgramId) },
        fetchPolicy: 'network-only',
      });
      const studentsFromProgram = data?.nonAllocatedStudents || [];
      // ---- normalize shape for UI -----------------------------------------
      const normalized = studentsFromProgram.map((s, idx) => ({
        student_id: s.studentId,
        firstname: s.firstname,
        lastname: s.lastname,
        email: s.email,
        mobile: s.mobile || '',
        gender: s.gender || '',
        grade_id: s.gradeId || '',
        className: '',
        division: '',
        rollNumber: s.rollNumber || '',
        is_active: s.isActive ?? true,
        id: s.studentId || idx,
        programName:s.program?.programName || '',
      }));
      setStudents(normalized);
      setError(null);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [client, selectedProgramId]);  // run when selected program changes

  // Fetch all programs from database
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await collegeService.getAllprogram();
        if (response && response.length > 0) {
          setAllPrograms(response);
          // Set first program as selected and add to filter
          const firstProgram = response[0];
          setSelectedProgramId(firstProgram.program_id);
          setFilters(prev => ({ ...prev, program: [firstProgram.program_id] }));
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
      }
    };

    fetchPrograms();
  }, []);

  /* --------------------------------------------------- */
  /*  FILTER OPTIONS (derived from data) */
  /* --------------------------------------------------- */
  const programOptions   = allPrograms; // Use fetched programs instead of derived from students
  const classOptions     = [...new Set(students.map(s => s.className))].filter(Boolean);
  const divisionOptions  = [...new Set(students.map(s => s.division))].filter(Boolean);

  /* --------------------------------------------------- */
  /*  FILTERED + PAGINATED DATA */
  /* --------------------------------------------------- */
  const paginatedData = useMemo(() => {
    let list = students;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        `${s.firstname} ${s.lastname}`.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.mobile?.includes(q)
      );
    }

    // Program filter removed - filtering is done at API level via selectedProgramId

    // Class
    if (filters.classDataId.length) {
      list = list.filter(s => filters.classDataId.includes(s.className));
    }

    // Division
    if (filters.gradeDivisionId.length) {
      list = list.filter(s => filters.gradeDivisionId.includes(s.division));
    }

    // Status
    if (filters.activeInactiveStatus !== 'all') {
      const wantActive = filters.activeInactiveStatus === 'active';
      list = list.filter(s => s.is_active === wantActive);
    }

    // Reverse the list to show students in reverse order
    list = list.reverse();

    // Pagination
    const totalEntries = list.length;
    const totalPages   = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end   = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [students, searchQuery, filters, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const resetPage  = () => setCurrentPage(1);

  /* --------------------------------------------------- */
  /*  TOGGLE ACTIVE / INACTIVE */
  /* --------------------------------------------------- */
const toggleActive = async (studentId) => {
  // Find the current student
  const student = students.find(s => s.student_id === studentId);
  if (!student || statusChanging[studentId]) return;

  setStatusChanging(prev => ({ ...prev, [studentId]: true }));
  
  try {
    // Determine new status (toggle current status)
    const newStatus = !student.is_active;
    const response = await changeStatus(studentId, newStatus);
    
    // Update UI on successful API call
    setStudents(prev =>
      prev.map(s => (s.student_id === studentId ? { ...s, is_active: newStatus } : s))
    );
    
    setAlertMessage(`Student ${student.firstname} ${student.lastname} has been ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    setShowSuccessAlert(true);
  } catch (error) {
    console.error('Failed to change student status:', error);
    
    let errorMessage = 'Failed to change student status. Please try again.';
    if (error?.response?.status) {
      switch (error.response.status) {
        case 404:
          errorMessage = 'Student not found.';
          break;
        case 403:
          errorMessage = 'You do not have permission to change this student status.';
          break;
        case 400:
          errorMessage = 'Invalid request. Please check student information.';
          break;
        default:
          if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    setAlertMessage(errorMessage);
    setShowErrorAlert(true);
  } finally {
    setStatusChanging(prev => ({ ...prev, [studentId]: false }));
  }
};

  /* --------------------------------------------------- */
  /*  DELETE WITH API CALL */
  /* --------------------------------------------------- */
  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    setShowDeleteAlert(false);
    setPasswordAlert(true);
  };

  const handlePasswordConfirm = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const adminUserId = Number(currentUser?.jti);

      if (!password) {
        setAlertMessage("Please enter your admin password.");
        setShowErrorAlert(true);
        return;
      }

      const payload = {
        student_id: Number(studentToDelete.student_id),
        admin_user_id: adminUserId,
        admin_password: password,
      };

      console.log("Soft Delete Payload →", payload);

      const response = await softDeleteStudent(payload);

      if (response) {
        setPasswordAlert(false);
        setPassword("");
        setStudentToDelete(null);
        
        // Remove from UI
        setStudents(prev => prev.filter(s => s.student_id !== studentToDelete.student_id));
        resetPage();
        
        // Show success alert
        setAlertMessage(`Student ${studentToDelete.firstname} ${studentToDelete.lastname} has been successfully soft deleted!`);
        setShowSuccessAlert(true);
      }
    } catch (error) {
  console.error("Soft delete failed:", error);

  setPasswordAlert(false);
  setPassword("");
  setStudentToDelete(null);

  let errorMessage = "Failed to delete student. Please try again.";

  try {
    // 🔍 Try to extract JSON from the error if it contains JSON
    const match = error.message?.match(/\{.*\}$/);
    if (match) {
      const parsedError = JSON.parse(match[0]);
      errorMessage = parsedError.message || parsedError.error || errorMessage;
    } 
    // ✅ Axios error format
    else if (error.response?.data) {
      errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        JSON.stringify(error.response.data);
    }
  } catch (parseErr) {
    console.warn("Error parsing backend response:", parseErr);
  }

  setAlertMessage(errorMessage);
  setShowErrorAlert(true);
}


  };

  const handleCancelPassword = () => {
    setPasswordAlert(false);
    setPassword("");
    setStudentToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteAlert(false);
    setStudentToDelete(null);
  };

  /* --------------------------------------------------- */
  /*  SELECTION – using student_id */
  /* --------------------------------------------------- */
  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === currentEntries.length && currentEntries.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(currentEntries.map(s => s.student_id));
    }
  };

  /* --------------------------------------------------- */
  /*  PROGRAM CHIP HANDLERS */
  /* --------------------------------------------------- */
  const handleProgramChange = (e) => {
    const value = e.target.value;
    if (value && !filters.program.includes(value)) {
      setFilters(prev => ({ ...prev, program: [value] })); // Replace instead of adding
      setSelectedProgramId(value); // Update selected program ID to trigger API call
    }
    resetPage();
  };
  const removeProgram = (prog) => {
    const remaining = filters.program.filter(p => p !== prog);
    setFilters(prev => ({ ...prev, program: remaining }));
    
    // If removed program was selected, select the first remaining or clear
    if (selectedProgramId === prog) {
      if (remaining.length > 0) {
        setSelectedProgramId(remaining[0]);
      } else {
        setSelectedProgramId(null);
      }
    }
    resetPage();
  };

  /* --------------------------------------------------- */
  /*  SELECTED STUDENTS */
  /* --------------------------------------------------- */
  const selectedStudents = students.filter(s => selectedStudentIds.includes(s.student_id));

  /* --------------------------------------------------- */
  /*  RENDER – LOADING / ERROR */
  /* --------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------- */
  /*  MAIN UI */
  /* --------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

     {/* SEARCH + FILTER ROW */}
<div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
  {/* SEARCH */}
  <div className="relative w-full sm:w-80">
    <input
      type="search"
      placeholder="Search by name, email, or mobile..."
      className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        resetPage();
      }}
    />
  </div>

  {/* FILTER TOGGLE */}
  <div>
    <button
      onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
      className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all w-full sm:w-auto"
    >
      <Filter className="w-5 h-5 text-blue-600" />
      <span className="text-blue-600 font-medium">Filter</span>
    </button>
  </div>
</div>


        {/* FILTER PANEL */}
        {filters.filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Program */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[40px] bg-white">
                    {filters.program.map(progId => {
                      const prog = allPrograms.find(p => p.program_id === progId);
                      return (
                        <span
                          key={progId}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                        >
                          {prog ? prog.program_name : progId}
                          <button
                            onClick={() => removeProgram(progId)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                    <select
                      className="flex-1 bg-transparent outline-none text-sm min-w-[120px] appearance-none"
                      value={selectedProgramId || ""}
                      onChange={handleProgramChange}
                    >
                      <option value="" disabled>Select Program</option>
                      {programOptions.map(p => (
                        <option key={p.program_id} value={p.program_id}>{p.program_name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.activeInactiveStatus}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, activeInactiveStatus: e.target.value }));
                    resetPage();
                  }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SELECTED ACTION BAR */}
        {selectedStudentIds.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-gray-700">
                {selectedStudentIds.length} student{selectedStudentIds.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAllocateModal(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Allocate ({selectedStudentIds.length})
                </button>
                {/* <button
                  onClick={openPromotionModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Promotion
                </button> */}
              </div>
            </div>
          </div>
        )}

        {/* ==== DESKTOP TABLE ==== */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="table-header">
                <tr>
                  <th className="table-th">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === currentEntries.length && currentEntries.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Contact</th>
                  <th className="table-th table-cell-center">Status</th>
                  <th className="table-th table-cell-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEntries.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.student_id)}
                        onChange={() => toggleStudentSelection(student.student_id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          {student.gender === 'FEMALE' ? (
                            <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <User className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900">
                            {student.firstname} {student.lastname}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.programName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {student.email}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {student.mobile}
                        </div>
                      </div>
                    </td>                   
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(student.student_id)}
                        disabled={statusChanging[student.student_id]}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          statusChanging[student.student_id]
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : student.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {statusChanging[student.student_id] ? (
                          <>
                            <div className="w-4 h-4 mr-1 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            {student.is_active ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                            {student.is_active ? 'Active' : 'Inactive'}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/student/view-student/${student.student_id}`}>
                          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link to={`/student/edit-student/${student.student_id}`}>
                          <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(student)} 
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalEntries > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-white ${currentPage === 1 ? 'bg-blue-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium">
                Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-white ${currentPage === totalPages ? 'bg-blue-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* ==== MOBILE CARDS ==== */}
        <div className="lg:hidden space-y-4">
          {currentEntries.map((student) => (
            <div key={student.student_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student.student_id)}
                    onChange={() => toggleStudentSelection(student.student_id)}
                    className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {student.gender === 'FEMALE' ? (
                      <svg className="w-7 h-7 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <User className="w-7 h-7 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">
                      {student.firstname} {student.lastname}
                    </p>
                    <p className="text-sm text-gray-600">
                      {student.programName}  
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(student.student_id)}
                  disabled={statusChanging[student.student_id]}
                  className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    statusChanging[student.student_id]
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {statusChanging[student.student_id] ? (
                    <>
                      <div className="w-3.5 h-3.5 mr-1 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      {student.is_active ? <ToggleRight className="w-3.5 h-3.5 mr-1" /> : <ToggleLeft className="w-3.5 h-3.5 mr-1" />}
                      {student.is_active ? 'Active' : 'Inactive'}
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {student.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {student.mobile}
                </div>
                <div className="text-gray-600">{student.className || '—'}</div>
              </div>

              <div className="flex justify-end gap-2">
                <Link to={`/student/view-student/${student.student_id}`}>
                  <button className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <Link to={`/student/edit-student/${student.student_id}`}>
                  <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                    <Edit className="w-4 h-4" />
                  </button>
                </Link>
                <button 
                  onClick={() => handleDelete(student)} 
                  className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* MOBILE PAGINATION */}
          {totalEntries > 0 && (
            <div className="flex justify-between items-center mt-6">
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
          )}
        </div>

        {/* EMPTY STATE */}
        {totalEntries === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600">No students found matching your filters.</p>
          </div>
        )}

        {/* DELETE CONFIRMATION */}
        {showDeleteAlert && (
          <SweetAlert
            warning
            showCancel
            confirmBtnText="Yes, delete it!"
            confirmBtnCssClass="btn-confirm"
            cancelBtnCssClass="btn-cancel"
            title="Are you sure?"
            onConfirm={confirmDelete}
            onCancel={handleCancelDelete}
          >
            Do you want to delete <strong>{studentToDelete?.firstname} {studentToDelete?.lastname}</strong>?
          </SweetAlert>
        )}

        {/* Password Protected Delete Confirmation (Second Step) */}
        {passwordAlert && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4 sm:px-0">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md animate-fadeIn">
              {/* Title */}
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-800">
                Admin Verification Required
              </h3>

              {/* Subtitle */}
              <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">
                Enter your admin password to confirm deletion.
              </p>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePasswordConfirm();
                }}
                className="flex flex-col"
              >
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 text-center text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* Buttons Section */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={handleCancelPassword}
                    className="w-full sm:w-auto px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>

                  {/* Delete Button */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUCCESS ALERT */}
        {showSuccessAlert && (
          <SweetAlert
            success
            title="Success!"
            onConfirm={() => setShowSuccessAlert(false)}
            confirmBtnText="OK"
            confirmBtnCssClass="btn-confirm"
          >
            {alertMessage}
          </SweetAlert>
        )}

        {/* ERROR ALERT */}
        {showErrorAlert && (
          <SweetAlert
            error
            title="Error!"
            onConfirm={() => setShowErrorAlert(false)}
            confirmBtnText="OK"
            confirmBtnCssClass="btn-confirm"
          >
            {alertMessage}
          </SweetAlert>
        )}

        {/* ALLOCATE MODAL */}
        {showAllocateModal && (
          <AllocateStudent
            selectedStudents={selectedStudents}
            onClose={() => {
              setShowAllocateModal(false);
              setSelectedStudentIds([]);
            }}
            onAllocateSuccess={() => {
              setShowAllocateModal(false);
              setSelectedStudentIds([]);
              // Refresh the student list to remove allocated students
              loadStudents();
            }}
          />
        )}

        {/* PROMOTION MODAL */}
        {showPromotionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: '#2162C1' }}>
                <h3 className="text-lg font-semibold text-white">Promotion</h3>
                <button
                  onClick={closePromotionModal}
                  className="text-white hover:text-gray-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Program */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Program <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={promotionData.program}
                      onChange={(e) => setPromotionData(prev => ({ ...prev, program: e.target.value }))}
                    >
                      <option value="" disabled>Select Program</option>
                      {programOptions.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={promotionData.class}
                      onChange={(e) => setPromotionData(prev => ({ ...prev, class: e.target.value }))}
                    >
                      <option value="" disabled>Select Class</option>
                      {classOptions.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Batch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={promotionData.batch}
                      onChange={(e) => setPromotionData(prev => ({ ...prev, batch: e.target.value }))}
                    >
                      <option value="" disabled>Select Batch</option>
                      {batchOptions.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Division <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={promotionData.division}
                      onChange={(e) => setPromotionData(prev => ({ ...prev, division: e.target.value }))}
                    >
                      <option value="" disabled>Select Division</option>
                      {divisionOptions.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Academic Year <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={promotionData.academicYear}
                      onChange={(e) => setPromotionData(prev => ({ ...prev, academicYear: e.target.value }))}
                    >
                      <option value="" disabled>Select Academic Year</option>
                      {batchOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3 px-6 pb-6">
                <button
                  onClick={closePromotionModal}
                  className="px-6 py-2.5 border border-blue-600 text-white rounded-lg hover:bg-blue-50 transition"
                  style={{ backgroundColor: '#2162C1' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromote}
                  className="px-6 py-2.5 text-white rounded-lg hover:bg-blue-700 transition"
                  style={{ backgroundColor: '#2162C1' }}
                  disabled={
                    !promotionData.program ||
                    !promotionData.class ||
                    !promotionData.batch ||
                    !promotionData.division ||
                    !promotionData.academicYear
                  }
                >
                  Promote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}