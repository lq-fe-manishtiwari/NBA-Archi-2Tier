'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Filter, ChevronDown, Plus, Upload, Eye, Edit, Trash2, User, Mail, Phone, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";
import BulkUploadModal from "./BulkUploadModal";
import { Link } from "react-router-dom";
import { OtherStaffService } from '../Service/OtherStaff.service';

export default function Dashboard() {
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // New states for password-protected deletion
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [filters, setFilters] = useState({
    program: [],
    classDataId: [],
    gradeDivisionId: [],
    activeInactiveStatus: 'all',
    filterOpen: false,
  });

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    if (!isFetchedRef.current) {
      getAllOtherStaff();
      isFetchedRef.current = true;
    }
  }, []);

  const getAllOtherStaff = () => {
    OtherStaffService.getAllOtherStaff()
      .then((res) => {
        // Reverse the array so the last item becomes the first
        const reversedData = Array.isArray(res) ? [...res].reverse() : res;
        setStaff(reversedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  /* ==================== PAGINATION & FILTERING ==================== */
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndPaginatedStaff = useMemo(() => {
    let list = staff;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          `${s.firstname} ${s.lastname}`.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.designation?.toLowerCase().includes(q)
      );
    }

    // Status Filter
    if (filters.activeInactiveStatus !== 'all') {
      const isActive = filters.activeInactiveStatus === 'active';
      list = list.filter((s) => s.active === isActive);
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [staff, searchQuery, currentPage, filters.activeInactiveStatus]);

  const { currentEntries, totalEntries, totalPages, start, end } = filteredAndPaginatedStaff;

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  /* ==================== DELETE HANDLERS ==================== */
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowAlert(true);
  };

  const handleConfirmDelete = () => {
    setShowAlert(false);
    setPasswordAlert(true);
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setDeleteId(null);
  };

  const handlePasswordConfirm = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const adminUserId = Number(currentUser?.jti);
  
      if (!password) {
        SweetAlert({
          title: "Error!",
          text: "Please enter your admin password.",
          type: "error",
          confirmButtonText: "OK"
        });
        return;
      }
  
      const payload = {
        other_staff_id: Number(deleteId),
        admin_user_id: adminUserId,
        admin_password: password,
      };
  
      //  Call the API
      const response = await OtherStaffService.softDeleteOtherStaff(payload);
  
      //  If API returns 400 inside try (handle before catch)
      if (response?.status === 400) {
        const message =
          response?.message ||
          response?.error ||
          "Invalid admin password. Please try again.";
        setErrorMessage(message);
        setShowErrorAlert(true);
        return;
      }
  
      //  If successful
      setPasswordAlert(false);
      setPassword("");
      setDeleteId(null);
      setShowSuccessAlert(true);
      getAllOtherStaff();
  
    } catch (error) {
      console.log("Full error object:", error);
      console.log("Error response:", error.response);
      console.log("Error data:", error.response?.message);
  
      //  Extract proper message
      let apiErrorMessage = "Something went wrong. Try again.";
      const status = error?.response?.status;
  
      if (status === 400) {
        apiErrorMessage =
          error?.response?.message ||
          error?.response?.error ||
          "Invalid admin password. Please try again.";
      } else if (error?.message) {
        apiErrorMessage = error.message;
      }
  
      setErrorMessage(apiErrorMessage);
      setShowErrorAlert(true);
    }
  };

  const handleCancelPassword = () => {
    setPasswordAlert(false);
    setPassword("");
    setDeleteId(null);
  };

  /* ==================== TOGGLE ACTIVE STATUS ==================== */
  const toggleActive = async (id) => {
    const member = staff.find((s) => s.other_staff_id === id);
    if (!member) return;

    const newStatus = !member.active;
    setLoadingToggle(id);

    try {
      // API CALL
      await OtherStaffService.updateOtherStaffStatus(id, newStatus);

      // Optimistic UI update
      setStaff((prev) =>
        prev.map((s) =>
          s.other_staff_id === id ? { ...s, active: newStatus } : s
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoadingToggle(null);
    }
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUpload(false); // Close modal
    getAllOtherStaff();
    setAlert(
      <SweetAlert
        success
        title="Success!"
        onConfirm={() => setShowSuccessAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        Other staff data uploaded successfully.
      </SweetAlert>
    );
  };

  const handleProgramChange = (e) => {
    const value = e.target.value;
    if (value && !filters.program.includes(value)) {
      setFilters((prev) => ({ ...prev, program: [...prev.program, value] }));
    }
    e.target.value = '';
  };

  const removeProgram = (prog) => {
    setFilters((prev) => ({
      ...prev,
      program: prev.program.filter((p) => p !== prog),
    }));
  };

  /* ==================== RENDER ==================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search by name, email, or profile..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/other-staff/add-OtherStaff">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
                <Plus className="w-4 h-4" />
                Add New Member
              </button>
            </Link>

            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Filter Button */}
        <div className="mb-4">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
          </button>
        </div>

        {/* Filters Panel */}
        {filters.filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.activeInactiveStatus}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      activeInactiveStatus: e.target.value,
                    }))
                  }
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Profile</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentEntries.map((member) => (
                <tr key={member.other_staff_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {member.firstname} {member.lastname}
                        </p>
                        <p className="text-xs text-gray-500">{member.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{member.designation}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-700">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {member.email}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {member.mobile}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(member.other_staff_id)}
                      disabled={loadingToggle === member.other_staff_id}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        member.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {loadingToggle === member.other_staff_id ? (
                        <span className="w-4 h-4 border-2 border-t-transparent border-gray-600 rounded-full animate-spin mr-1" />
                      ) : member.active ? (
                        <ToggleRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 mr-1" />
                      )}
                      {member.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <Link to={`/other-staff/view-other-staff/${member.other_staff_id}`}>
                      <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link to={`/other-staff/edit-other-staff/${member.other_staff_id}`}>
                      <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(member.other_staff_id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalEntries > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-white ${currentPage === 1 ? 'bg-blue-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Previous
              </button>

              <span className="text-gray-700 font-medium">
                Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-white ${currentPage === totalPages ? 'bg-blue-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {currentEntries.map((member) => (
            <div key={member.other_staff_id} className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {member.firstname} {member.lastname}
                    </p>
                    <p className="text-sm text-gray-600">{member.designation}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleActive(member.other_staff_id)}
                  disabled={loadingToggle === member.other_staff_id}
                  className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    member.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {loadingToggle === member.other_staff_id ? (
                    <span className="w-3.5 h-3.5 border-2 border-t-transparent border-gray-600 rounded-full animate-spin mr-1" />
                  ) : member.active ? (
                    <ToggleRight className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <ToggleLeft className="w-3.5 h-3.5 mr-1" />
                  )}
                  {member.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {member.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {member.mobile}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Link to={`/other-staff/view-other-staff/${member.other_staff_id}`}>
                  <button className="p-2 bg-blue-100 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <Link to={`/other-staff/edit-other-staff/${member.other_staff_id}`}>
                  <button className="p-2 bg-yellow-100 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(member.other_staff_id)}
                  className="p-2 bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {totalEntries === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600">No staff members found.</p>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <BulkUploadModal
            onClose={() => setShowBulkUpload(false)}
            onSuccess={handleBulkUploadSuccess}
            setAlert={setAlert}
          />
        )}

        {/* First Confirmation SweetAlert */}
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
            Do you want to delete this Other Staff?
          </SweetAlert>
        )}
        {alert}

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

        {/* Success SweetAlert after deletion */}
        {showSuccessAlert && (
          <SweetAlert
            success
            title="Staff Soft Deleted!"
            onConfirm={() => setShowSuccessAlert(false)}
            confirmBtnCssClass="btn-confirm"
          >
            Staff member has been successfully soft deleted.
          </SweetAlert>
        )}

      {/* Error SweetAlert for wrong password */}
       {showErrorAlert && (
         <SweetAlert
           error
           title="Error!"
           onConfirm={() => {
             setShowErrorAlert(false);
             setErrorMessage('');
             // Password modal stays open for retry
           }}
           confirmBtnCssClass="btn-confirm"
         >
           {errorMessage}
         </SweetAlert>
       )}
      </div>
    </div>
  );
}