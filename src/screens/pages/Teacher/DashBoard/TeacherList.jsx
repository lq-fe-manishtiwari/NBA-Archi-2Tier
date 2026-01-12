'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus, Upload, Search, Filter,
  ToggleLeft, ToggleRight, User, Mail, Phone, X, ChevronDown
} from 'lucide-react';
import BulkUploadModal from "../Components/BulkUploadModal";
import TeacherIdCard from '../Components/TeacherIdCard';
import AllocateTeacher from '../Components/AllocateTeacher';
import TeacherTable from '../DashBoard/TeacherTable';
import studentActive from "@/_assets/images_new_design/sidebarIcon/studentActive.svg";
import SweetAlert from 'react-bootstrap-sweetalert';
import { useNavigate } from "react-router-dom";
import {
  fetchAllTeachers,
  updateTeacherStatus,
  softDeleteTeacher,
  hardDeleteTeacher
} from '../Services/teacher.service';

// Custom Select Components
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MultiSelectProgram = ({ label, selectedPrograms, programOptions, onProgramChange, onProgramRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const availableOptions = programOptions.filter(p => !selectedPrograms.includes(p));

  const handleSelect = (program) => {
    onProgramChange({ target: { value: program } });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-blue-400 transition-all duration-150"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedPrograms.length > 0 ? (
            selectedPrograms.map(prog => (
              <span
                key={prog}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {prog}
                <button
                  onClick={() => onProgramRemove(prog)}
                  className="hover:bg-blue-200 rounded-full p-0.5 ml-0.5 transition-colors"
                  title="Remove Program"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm ml-1">Select Program(s)</span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableOptions.length > 0 ? (
              availableOptions.map(prog => (
                <div
                  key={prog}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSelect(prog)}
                >
                  {prog}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">All programs selected.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
export default function TeacherList() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    program: [],
    selectedGrade: [],
    classDataId: [],
    gradeDivisionId: [],
    activeInactiveStatus: 'all',
    filterOpen: false
  });

  // Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');
  const [showStatusSuccessAlert, setShowStatusSuccessAlert] = useState(false);
  const [showStatusErrorAlert, setShowStatusErrorAlert] = useState(false);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [statusChanging, setStatusChanging] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState(null); // Only one teacher ID

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [showAllocateTeacher, setShowAllocateTeacher] = useState(false);
  const [showNonAllocateAlert, setShowNonAllocateAlert] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based pagination
  const entriesPerPage = 10;

  // 📋 Load Teachers from API
  const loadTeachers = async (page = 0, size = entriesPerPage) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAllTeachers(page, size);

      // Transform API data to match UI expectations
      const transformedTeachers = result.content.map(teacher => ({
        id: teacher.teacherId,
        name: `${teacher.firstname} ${teacher.lastname || ''}`.trim(),
        email: teacher.email,
        mobile: teacher.mobile,
        gender: teacher.gender || 'MALE',
        designation: teacher.designation,
        username: teacher.username,
        active: teacher.active,
        userType: teacher.userType,
        // Map additional fields for UI compatibility
        grade: teacher.designation || 'Teacher',
        division: 'A', // Default since API doesn't provide this
        className: teacher.designation || 'General',
        avatar: null
      }));

      console.log('🔍 Transformed Teachers:', transformedTeachers);
      console.log('🔍 Setting teachers count:', transformedTeachers.length);

      setTeachers(transformedTeachers);
      setTotalTeachers(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError(err.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Toggle Teacher Active Status
  const toggleActive = async (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || statusChanging[teacherId]) return;

    setStatusChanging(prev => ({ ...prev, [teacherId]: true }));

    try {
      const newStatus = !teacher.active;
      await updateTeacherStatus(teacherId, newStatus);

      // Update local state
      setTeachers(prev => prev.map(t =>
        t.id === teacherId ? { ...t, active: newStatus } : t
      ));

      setAlertMessage(`Teacher ${teacher.name} has been ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      setShowStatusSuccessAlert(true);
    } catch (error) {
      console.error('Error updating teacher status:', error);

      let errorMessage = 'Failed to change teacher status. Please try again.';
      if (error?.response?.status) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'Teacher not found.';
            break;
          case 403:
            errorMessage = 'You do not have permission to change this teacher status.';
            break;
          case 400:
            errorMessage = 'Invalid request. Please check teacher information.';
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
      setShowStatusErrorAlert(true);
    } finally {
      setStatusChanging(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  // 🗑️ Delete Teacher
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowAlert(true);
  };

  const handleConfirmDelete = () => {
    setShowAlert(false);
    setPasswordAlert(true);
  };

  const handlePasswordConfirm = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const adminUserId = Number(currentUser?.jti);

      if (!password) {
        alert("Please enter your admin password.");
        setShowStatusErrorAlert(true);
        return;
      }

      const payload = {
        teacher_id: Number(deleteId),
        admin_user_id: adminUserId,
        admin_password: password,
      };

      console.log("Soft Delete Payload →", payload);

      const response = await softDeleteTeacher(payload);

      if (response) {
        setPasswordAlert(false);
        setPassword("");
        setDeleteId(null);
        setAlertMessage("Teacher has been successfully soft deleted!");
        setShowDeleteSuccessAlert(true);

        // Reload data to ensure consistency
        await loadTeachers(currentPage, entriesPerPage);
      }
    } catch (error) {
      console.error("Soft delete failed:", error);

      setPasswordAlert(false);
      setPassword("");
      setDeleteId(null);
      setAlertMessage(errorMessage);
      setShowDeleteErrorAlert(true);
      let errorMessage = "Failed to delete teacher. Please try again.";
      alert(error?.message || "Failed to delete teacher. Please try again.");
    }
  };

  const handleCancelPassword = () => {
    setPasswordAlert(false);
    setPassword("");
    setDeleteId(null);
  };

  // 📋 Handle Bulk Upload Success
  const handleBulkUploadSuccess = (count) => {
    alert(`Successfully uploaded ${count} teachers!`);
    loadTeachers(currentPage, entriesPerPage); // Reload data
  };

  // 📄 Load initial data - Only load once on component mount
  useEffect(() => {
    console.log('🔍 Initial load triggered');
    loadTeachers(0, entriesPerPage); // Always start with page 0
  }, []); // Empty dependency array = run only once on mount

  // ⚙️ Handle Page Change
  const handlePageChange = (newPage) => {
    console.log('🔍 Page change requested:', newPage, 'current:', currentPage);
    const newPageIndex = newPage - 1; // Convert to 0-based for API
    if (newPageIndex !== currentPage) {
      setCurrentPage(newPageIndex);
    }
  };

  // Mock filter options
  const programOptions = ['MCA-BTech-Graduation', 'BCA', 'BBA', 'M.Tech'];
  const classOptions = ['Class 7A', 'Class 7C', 'Class 8A', 'Class 8B', 'Class 9B', 'Class 10A'];
  const divisionOptions = ['A', 'B', 'C'];

  // Filter logic
  const filteredTeachers = useMemo(() => {
    let filtered = teachers;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.mobile.includes(searchQuery)
      );
    }

    if (filters.program.length > 0) {
      filtered = filtered.filter(t => filters.program.some(p => t.grade.includes(p)));
    }

    if (filters.classDataId.length > 0) {
      filtered = filtered.filter(t => filters.classDataId.includes(t.className));
    }

    if (filters.gradeDivisionId.length > 0) {
      filtered = filtered.filter(t => filters.gradeDivisionId.includes(t.division));
    }

    if (filters.activeInactiveStatus !== 'all') {
      filtered = filtered.filter(t =>
        (filters.activeInactiveStatus === 'active') === t.active
      );
    }

    return filtered;
  }, [teachers, searchQuery, filters]);

  // Handle single teacher selection
  const handleTeacherSelect = (id) => {
    setSelectedTeacher(prev => (prev === id ? null : id));
  };

  const handleAllocateClose = () => {
    setShowAllocateTeacher(false);
    setSelectedTeacher(null);
    setShowNonAllocateAlert(false);
  };

  // Bulk actions (for single teacher)
  const handleTeacherAllocate = () => {
    if (selectedTeacher) {
      setShowAllocateTeacher(true);
    }
  };

  const handleTeacherNonAllocate = () => {
    if (selectedTeacher) {
      setShowNonAllocateAlert(true);
    }
  };

  const handleConfirmNonAllocate = () => {
    console.log('Non-allocating teacher:', selectedTeacher);
    alert(`Non-allocated teacher ID: ${selectedTeacher}`);
    setShowNonAllocateAlert(false);
    setSelectedTeacher(null);
  };

  const handleCancelNonAllocate = () => {
    setShowNonAllocateAlert(false);
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setDeleteId(null);
  };

  // Handle Program Selection (Multi)
  const handleProgramChange = (e) => {
    const value = e.target.value;
    if (value && !filters.program.includes(value)) {
      setFilters(prev => ({ ...prev, program: [...prev.program, value] }));
    }
  };

  const removeProgram = (prog) => {
    setFilters(prev => ({ ...prev, program: prev.program.filter(p => p !== prog) }));
  };

  // Navigation handlers
  const handleViewTeacher = (teacher) => {
    navigate(`/teacher-list/teacher-view/${btoa(teacher.id)}`, { state: { teacher } });
  };

  const handleEditTeacher = (teacher) => {
    navigate(`/teacher-list/teacher-edit/${btoa(teacher.id)}`, { state: { teacher } });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    loadTeachers(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 w-full mb-3">
        <button
          onClick={() => navigate("/teacher-list/add-teacher")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Teacher
        </button>

        <button
          onClick={() => setShowBulkUpload(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
        >
          <Upload className="w-5 h-5" />
          Bulk Upload
        </button>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">

        <div className="max-w-7xl mx-auto">



          {/* Filter Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
            {/* SEARCH */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search for teacher"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* FILTER BUTTON */}
            <div className="flex justify-end w-full sm:w-auto">
              <button
                onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all w-full sm:w-auto"
              >
                <Filter className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 font-medium">Filter</span>
                <ChevronDown
                  className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>
            </div>
          </div>


          {/* Filter Panel */}
          {filters.filterOpen && (
            <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MultiSelectProgram
                  label="Program"
                  selectedPrograms={filters.program}
                  programOptions={programOptions}
                  onProgramChange={handleProgramChange}
                  onProgramRemove={removeProgram}
                />

                <CustomSelect
                  label="Class"
                  value={filters.classDataId[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    classDataId: e.target.value ? [e.target.value] : [],
                    gradeDivisionId: []
                  }))}
                  options={classOptions}
                  placeholder="Select Classes"
                  disabled={filters.program.length === 0}
                />

                <CustomSelect
                  label="Division"
                  value={filters.gradeDivisionId[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    gradeDivisionId: e.target.value ? [e.target.value] : []
                  }))}
                  options={divisionOptions}
                  placeholder="Select Divisions"
                  disabled={!filters.classDataId.length}
                />

                <CustomSelect
                  label="Status"
                  value={filters.activeInactiveStatus.charAt(0).toUpperCase() + filters.activeInactiveStatus.slice(1) || 'All'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    activeInactiveStatus: e.target.value.toLowerCase()
                  }))}
                  options={['All', 'Active', 'Inactive']}
                  placeholder="Select Status"
                />
              </div>
            </div>
          )}

          {/* Bulk Actions Panel - Only show if one teacher is selected */}
          {selectedTeacher && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                <div className="flex flex-wrap justify-end gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleTeacherAllocate}
                    className={`flex items-center gap-2 font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg
          ${showAllocateTeacher
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-orange-500 text-primary-50 hover:bg-gray-300"
                      }`}
                  >
                    Allocate
                  </button>
                </div>
              </div>
            </div>

          )}

          {/* Teacher Table Component */}
          <TeacherTable
            teachers={filteredTeachers}
            selectedTeacher={selectedTeacher}
            onTeacherSelect={handleTeacherSelect}
            onToggleActive={toggleActive}
            onView={handleViewTeacher}
            onEdit={handleEditTeacher}
            onDelete={handleDelete}
            onShowIdCard={setShowIdCard}
            currentPage={currentPage}
            entriesPerPage={entriesPerPage}
            onPageChange={handlePageChange}
            loading={loading}
            totalTeachers={totalTeachers}
            totalPages={totalPages}
            statusChanging={statusChanging}
          />

        </div>
      </div>

      {/* Modals and Alerts */}
      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onSuccess={handleBulkUploadSuccess}
        />
      )}

      {showIdCard && (
        <TeacherIdCard teacher={showIdCard} onClose={() => setShowIdCard(false)} />
      )}

      {showAllocateTeacher && selectedTeacher && (
        <AllocateTeacher
          key={selectedTeacher}
          onClose={handleAllocateClose}
          teacherData={teachers.find(t => t.id === selectedTeacher)}
        />
      )}

      {/* Single Delete Alert */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          Do you want to delete this Teacher?
        </SweetAlert>
      )}

      {/* Non-Allocate Alert */}
      {showNonAllocateAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmNonAllocate}
          onCancel={handleCancelNonAllocate}
        >
          Do you want to non-allocate this teacher?
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

      {/* Status Change Success Alert */}
      {showStatusSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowStatusSuccessAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Status Change Error Alert */}
      {showStatusErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setShowStatusErrorAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Delete Success Alert */}
      {showDeleteSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowDeleteSuccessAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Delete Error Alert */}
      {showDeleteErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setShowDeleteErrorAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
    </>
  );
}