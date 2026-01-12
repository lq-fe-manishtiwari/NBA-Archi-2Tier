'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, ToggleLeft, ToggleRight, Eye, Edit, Trash2,
  Filter, X, ChevronDown
} from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import PromoteStudent from '../Components/PromoteStudent';
import { softDeleteStudent, StudentDeallocation, changeStatus } from '../Services/student.service';
import { client, studentsByAcademicYear as studentsByAcademicYearQuery } from '../Services/graphql.service.js';
import { collegeService } from '../../Academics/Services/college.service';
import { batchService } from '../../Academics/Services/batch.Service';
import { DivisionService } from '../../Academics/Services/Division.service';
import { classService } from '../../Academics/Services/class.service';

export default function AllocatedStudent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPrograms, setAllPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYearClass, setSelectedAcademicYearClass] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [divisions, setDivisions] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusChanging, setStatusChanging] = useState({});

  // Alert states for delete and status operations
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // New states for password-protected deletion
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');

  // New states for deallocation
  const [showDeallocationAlert, setShowDeallocationAlert] = useState(false);
  const [showDeallocationSuccessAlert, setShowDeallocationSuccessAlert] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const entriesPerPage = 10;

  // Fetch all batches from database
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await batchService.getBatch();

        if (response && response.length > 0) {
          setBatches(response);

          // Select first batch by default
          const firstBatch = response[0];
          setSelectedBatch(firstBatch.batch_id);
          // Extract academic years with class info from first batch
          const years = firstBatch.academic_years.map(ay => ({
            id: ay.academic_year_id,
            year: ay.name,
            batchId: firstBatch.batch_id,
            classYearId: ay.program_class_year?.class_year?.class_year_id,
            className: ay.program_class_year?.class_year?.name
          }));
          setAcademicYears(years);

          // Select first academic year/class by default
          if (years.length > 0 && years[0].classYearId) {
            setSelectedAcademicYearClass(`${years[0].id}-${years[0].classYearId}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch batches:', err);
      }
    };

    fetchBatches();
  }, []);

  // Update academic years when batch changes
  useEffect(() => {
    if (!selectedBatch || batches.length === 0) return;

    const batch = batches.find(b => b.batch_id === selectedBatch);
    if (batch && batch.academic_years) {
      const years = batch.academic_years.map(ay => ({
        id: ay.academic_year_id,
        year: ay.name,
        batchId: batch.batch_id,
        classYearId: ay.program_class_year?.class_year?.class_year_id,
        className: ay.program_class_year?.class_year?.name
      }));

      setAcademicYears(years);

      // Select first academic year/class from selected batch
      if (years.length > 0 && years[0].classYearId) {
        setSelectedAcademicYearClass(`${years[0].id}-${years[0].classYearId}`);
      }
    }
  }, [selectedBatch, batches]);

  // Fetch semesters when academic year/class changes
  useEffect(() => {
    const loadSemesters = async () => {
      if (!selectedAcademicYearClass) {
        setSemesters([]);
        setSelectedSemester('');
        return;
      }

      // Extract class_year_id from the combined value
      const parts = selectedAcademicYearClass.split('-');
      if (parts.length !== 2) return;

      const classYearId = parts[1];

      try {
        const response = await classService.getClassById(classYearId);

        if (response && response.semesters && response.semesters.length > 0) {
          const semesterList = response.semesters.map(sem => ({
            id: sem.semester_id,
            name: sem.name,
            number: sem.semester_number
          }));
          setSemesters(semesterList);

          // Select first semester by default
          if (semesterList.length > 0) {
            setSelectedSemester(String(semesterList[0].id));
          }
        } else {
          setSemesters([]);
          setSelectedSemester('');
        }
      } catch (error) {
        console.error("Failed to load semesters:", error);
        setSemesters([]);
        setSelectedSemester('');
      }
    };

    loadSemesters();
  }, [selectedAcademicYearClass]);

  // Fetch divisions when semester changes
  useEffect(() => {
    const loadDivisions = async () => {
      if (!selectedSemester || !selectedAcademicYearClass) {
        setDivisions([]);
        return;
      }

      // Extract class_year_id from the combined value
      const parts = selectedAcademicYearClass.split('-');
      if (parts.length !== 2) return;

      const classYearId = parts[1];

      try {
        const response = await DivisionService.getDivision();

        if (response && response.length > 0) {
          // Filter divisions by selected class_year_id
          // const filteredDivisions = response.filter(div =>
          //   String(div.class_year_id) === String(classYearId)
          // );
          setDivisions(response);
        }
      } catch (error) {
        console.error("Failed to load divisions:", error);
        setDivisions([]);
      }
    };

    loadDivisions();
  }, [selectedSemester, selectedAcademicYearClass]);

  // Fetch allocated students by academic year
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedAcademicYearClass) {
        setLoading(false);
        return;
      }

      // Extract academic_year_id from the combined value
      const parts = selectedAcademicYearClass.split('-');
      if (parts.length !== 2) {
        setLoading(false);
        return;
      }

      const academicYearId = parts[0];

      try {
        setLoading(true);

        const { data } = await client.query({
          query: studentsByAcademicYearQuery,
          variables: { academicYearId: academicYearId },
          fetchPolicy: 'network-only',
        });

        const allocatedStudents = data?.studentsByAcademicYear || [];

        // Normalize shape for UI
        const normalized = allocatedStudents.map((item, idx) => ({
          id: item.student.studentId,
          student_id: item.student.studentId,
          allocationId: item.allocation.id,
          semesterId: item.allocation.semesterId || '',
          name: `${item.student.firstname} ${item.student.lastname}`,
          email: item.student.email,
          mobile: item.student.mobile || '',
          gender: item.student.gender || 'MALE',
          grade: item.allocation.academicYear?.program?.programName || '',
          division: item.allocation.division?.divisionName || '',
          className: item.allocation.academicYear?.classYear?.name || '',
          active: item.student.isActive ?? true,
          rollNumber: item.student.rollNumber || '',
          batchYear: item.allocation.academicYear?.name || '',
          programName: item.allocation.academicYear?.program?.programName || '',
          semesterName: item.allocation.semester?.name || '',

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

    loadStudents();
  }, [selectedAcademicYearClass, client]);

  // Filter State
  const [filters, setFilters] = useState({
    program: [],
    classDataId: [],
    gradeDivisionId: [],
    activeInactiveStatus: 'all',
    filterOpen: false
  });


  // Combined Filtering
  const filteredStudents = useMemo(() => {
    let list = students;
    console.log("students", students)

    if (searchQuery) {
      list = list.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.mobile.includes(searchQuery)
      );
    }

    if (filters.program.length > 0) {
      list = list.filter(t => filters.program.includes(t.grade));
    }

    if (filters.classDataId.length > 0) {
      list = list.filter(t => filters.classDataId.includes(t.className));
    }

    if (filters.gradeDivisionId.length > 0) {
      list = list.filter(t => filters.gradeDivisionId.includes(t.division));
    }

    if (selectedSemester) {
      list = list.filter(t => String(t.semesterId) === String(selectedSemester));
    }

    if (filters.activeInactiveStatus !== 'all') {
      const isActive = filters.activeInactiveStatus === 'active';
      list = list.filter(t => t.active === isActive);
    }

    return list;
  }, [students, searchQuery, filters]);

  const toggleActive = async (studentId) => {
    // Find the current student
    const student = students.find(s => s.id === studentId);
    if (!student || statusChanging[studentId]) return;

    setStatusChanging(prev => ({ ...prev, [studentId]: true }));

    try {
      // Determine the status to send to API
      // true for activation, false for deactivation
      const statusToSend = !student.active;

      // Call API with appropriate status
      const response = await changeStatus(studentId, statusToSend);

      // Update UI on successful API call
      setStudents(prev =>
        prev.map(s => (s.id === studentId ? { ...s, active: !student.active } : s))
      );

      setAlertMessage(`Student ${student.name} has been ${!student.active ? 'activated' : 'deactivated'} successfully!`);
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

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    setShowDeleteAlert(false);
    setPasswordAlert(true);
  };

  const handlePromotionClick = () => {
    if (selectedStudentIds.length === 0) return;
  
    const selected = students
      .filter(s => selectedStudentIds.includes(s.id))
      .map(s => ({
        student_id: s.student_id,
        allocationId: s.allocationId,
        name: s.name,
        batchYear: s.batchYear,
        academicYear: s.batchYear,
        className: s.className,
        division: s.division,
        rollNumber: s.rollNumber,
      }));
  
    navigate('/student/promotion', { state: { selectedStudents: selected } });
  };

  const handlePasswordConfirm = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const adminUserId = Number(currentUser?.jti);

      if (!password) {
        alert("Please enter your admin password.");
        return;
      }

      const payload = {
        student_id: Number(studentToDelete.id),
        admin_user_id: adminUserId,
        admin_password: password,
      };

      console.log("Soft Delete Payload →", payload);

      const response = await softDeleteStudent(payload);

      if (response) {
        setPasswordAlert(false);
        setPassword("");
        setStudentToDelete(null);

        // Remove from local state
        setStudents(prev => prev.filter(t => t.id !== studentToDelete.id));

        // Show success alert
        setAlertMessage(`Student ${studentToDelete.name} has been successfully soft deleted!`);
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error("Soft delete failed:", error);

      setPasswordAlert(false);
      setPassword("");
      setStudentToDelete(null);

      let errorMessage = "Failed to delete student. Please try again.";

      try {
        // Try to extract JSON from the error if it contains JSON
        const match = error.message?.match(/\{.*\}$/);
        if (match) {
          const parsedError = JSON.parse(match[0]);
          errorMessage = parsedError.message || parsedError.error || errorMessage;
        }
        // Axios error format
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

  const handleBulkDeallocate = () => {
    if (selectedStudentIds.length === 0) {
      return;
    }
    setShowDeallocationAlert(true);
  };

  const confirmDeallocate = async () => {
    setShowDeallocationAlert(false);

    try {
      // Get allocation IDs for selected students
      const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
      const allocationIds = selectedStudents.map(s => s.allocationId);

      console.log("Deallocating allocation IDs:", allocationIds);

      // Call deallocation API for each allocation
      const deallocationPromises = allocationIds.map(allocationId =>
        StudentDeallocation(allocationId)
      );

      await Promise.all(deallocationPromises);

      // Remove deallocated students from the list
      setStudents(prev => prev.filter(s => !selectedStudentIds.includes(s.id)));

      // Clear selection
      setSelectedStudentIds([]);

      // Show success message
      setShowDeallocationSuccessAlert(true);
    } catch (error) {
      console.error("Deallocation failed:", error);
      alert(error?.message || "Failed to deallocate students. Please try again.");
    }
  };

  const handleCancelDeallocate = () => {
    setShowDeallocationAlert(false);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(student => student.id));
    }
  };

  // Program Chip Handlers
  const handleProgramChange = (e) => {
    const value = e.target.value;
    if (value && !filters.program.includes(value)) {
      setFilters(prev => ({ ...prev, program: [...prev.program, value] }));
    }
    e.target.value = '';
  };

  const removeProgram = (prog) => {
    setFilters(prev => ({ ...prev, program: prev.program.filter(p => p !== prog) }));
  };

  // PAGINATION LOGIC
  const totalEntries = filteredStudents.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  console.log("filteredStudents", filteredStudents)
  const currentEntries = filteredStudents.slice(indexOfFirstEntry, indexOfLastEntry);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // === PROMOTION MODAL STATE ===
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  const openPromotionModal = () => setShowPromotionModal(true);
  const closePromotionModal = () => {
    setShowPromotionModal(false);
    setSelectedStudentIds([]);
  };

  const handlePromotionSuccess = () => {
    setShowPromotionModal(false);
    setSelectedStudentIds([]);
    // Refresh the student list after promotion
    window.location.reload();
  };

  // Get selected students for promotion
  const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
  console.log("currentEntries", currentEntries)
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">



        {/* Search + Filter Row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="search"
              placeholder="Search by name, email, or mobile..."
              className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Button (right-aligned) */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
          </button>
        </div>


        {/* Filter Panel */}
        {filters.filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

              {/* Batch Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={selectedBatch || ''}
                  onChange={(e) => setSelectedBatch(Number(e.target.value))}
                >
                  <option value="">Select Batch</option>
                  {batches.map(batch => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_name || batch.batch_year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year / Class Combined Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year / Class</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={selectedAcademicYearClass}
                  onChange={(e) => setSelectedAcademicYearClass(e.target.value)}
                  disabled={!selectedBatch || academicYears.length === 0}
                >
                  <option value="">Select Academic Year / Class</option>
                  {academicYears.map(year => (
                    <option key={`${year.id}-${year.classYearId}`} value={`${year.id}-${year.classYearId}`}>
                      {year.year} / {year.className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  disabled={!selectedAcademicYearClass || semesters.length === 0}
                >
                  <option value="">Select Semester</option>
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                  ))}
                </select>
              </div>

              {/* Division */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Division</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.gradeDivisionId[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    gradeDivisionId: e.target.value ? [e.target.value] : []
                  }))}
                  disabled={!selectedSemester || divisions.length === 0}
                >
                  <option value="">Select Division</option>
                  {divisions.map(d => (
                    <option key={d.division_id} value={d.division_name}>{d.division_name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.activeInactiveStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, activeInactiveStatus: e.target.value }))}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedStudentIds.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left content (if any) */}
              <div>
                {selectedStudentIds.length} student{selectedStudentIds.length > 1 ? 's' : ''} selected
              </div>

              {/* Buttons aligned right */}
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={handleBulkDeallocate}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                >
                  De-allocate
                </button>
                <button
                  onClick={handlePromotionClick}          // <-- changed
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Promotion
                </button>
              </div>
            </div>
          </div>

        )}

        {/* Desktop Table */}
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
                  <th className="table-th">Class / Sem</th>
                  <th className="table-th table-cell-center">Status</th>
                  <th className="table-th table-cell-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEntries.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
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
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.programName} - {student.division}</p>
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
                    <td className="px-6 py-4 text-sm text-gray-700">{student.className} / {student.semesterName}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(student.id)}
                        disabled={statusChanging[student.id]}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusChanging[student.id]
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : student.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                      >
                        {statusChanging[student.id] ? (
                          <>
                            <div className="w-4 h-4 mr-1 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            {student.active ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                            {student.active ? 'Active' : 'Inactive'}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/student/view-student/${student.id}`}>
                          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link to={`/student/edit-student/${student.id}`}>
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

          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-white ${currentPage === 1
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Previous
              </button>

              <span className="text-gray-700 font-medium">
                Showing {indexOfFirstEntry + 1}–{Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-white ${currentPage === totalPages
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {currentEntries.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student.id)}
                    onChange={() => toggleStudentSelection(student.id)}
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
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.grade} Division {student.division?.divisionName}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(student.id)}
                  disabled={statusChanging[student.id]}
                  className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${statusChanging[student.id]
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : student.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                  {statusChanging[student.id] ? (
                    <>
                      <div className="w-3.5 h-3.5 mr-1 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      {student.active ? <ToggleRight className="w-3.5 h-3.5 mr-1" /> : <ToggleLeft className="w-3.5 h-3.5 mr-1" />}
                      {student.active ? 'Active' : 'Inactive'}
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
                <div className="text-gray-600">{student.className}</div>
              </div>

              <div className="flex justify-end gap-2">
                <Link to={`/student/view-student/${student.id}`}>
                  <button className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <Link to={`/student/edit-student/${student.id}`}>
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
          {filteredStudents.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-white ${currentPage === 1
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-white ${currentPage === totalPages
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600">No students found matching your filters.</p>
          </div>
        )}

      </div>

      {/* Delete Confirmation */}
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
          Do you want to delete <strong>{studentToDelete?.name}</strong>?
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

      {/* Deallocation Confirmation */}
      {showDeallocationAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, deallocate!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={confirmDeallocate}
          onCancel={handleCancelDeallocate}
        >
          Do you want to deallocate the selected <strong>{selectedStudentIds.length}</strong> student(s)?
        </SweetAlert>
      )}

      {/* Deallocation Success Alert */}
      {showDeallocationSuccessAlert && (
        <SweetAlert
          success
          title="Students Deallocated!"
          onConfirm={() => setShowDeallocationSuccessAlert(false)}
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
        >
          Students have been successfully deallocated.
        </SweetAlert>
      )}

      {/* PROMOTION MODAL - Using PromoteStudent Component */}
      {showPromotionModal && (
        <PromoteStudent
          selectedStudents={selectedStudents}
          onClose={closePromotionModal}
          onPromotionSuccess={handlePromotionSuccess}
        />
      )}
    </div>
  );
}