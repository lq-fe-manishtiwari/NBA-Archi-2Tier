// src/screens/pages/NEWNBA/Components/AllocateUsersModal.jsx

import React, { useState, useEffect } from "react";
import { Search, Loader, Check, UserPlus, X } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
import { allocateUsersModalService } from "../Services/AllocateUsersModal.service";

const AllocateUsersModal = ({
  isOpen,
  onClose,
  criteriaId, // this is cycle_sub_category_id
  academicYear,
  programId,
  currentAllocated = [], // Contains: school_user + nba_contributor_allocation_id
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); // Only non-allocated users selected for allocation
  const [allocatedMap, setAllocatedMap] = useState({}); // userId → allocation_id (for deallocation)
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
      loadCurrentAllocations();
    }
  }, [isOpen, currentAllocated]);

  const loadCurrentAllocations = () => {
    const map = {};
    const selected = [];

    currentAllocated.forEach((item) => {
      const userId = item.school_user?.school_user_id || item.school_user_id;
      const allocationId = item.nba_contributor_allocation_id;
      if (userId && allocationId) {
        map[userId] = allocationId;
      }
    });

    setAllocatedMap(map);
    setSelectedUsers(selected); // Only new ones will be added here
  };

  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const users = await allocateUsersModalService.getAllUsers();

      setAvailableUsers(
        users.map((u) => ({
          id: u.otherStaffId,
          name: `${u.firstname || ""} ${u.lastname || ""}`.trim() || "Unnamed User",
          email: u.email || "No email",
          avatar: `${(u.firstname?.[0] || "?")}${(u.lastname?.[0] || "?")}`.toUpperCase(),
        }))
      );
    } catch (err) {
      console.error("Failed to load users:", err);
      alert("Failed to load contributors.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectForAllocation = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

const handleDeallocate = (userId) => {
  setUserToRemove(userId);
  setShowAlert(true);
};

const confirmDeallocate = async () => {
  const allocationId = allocatedMap[userToRemove];
  if (!allocationId) return;

  setShowAlert(false);
  try {
    await allocateUsersModalService.deAllocateContributor(allocationId);
    setAllocatedMap((prev) => {
      const updated = { ...prev };
      delete updated[userToRemove];
      return updated;
    });
    setShowSuccessAlert(true);
    onSuccess?.();
  } catch (err) {
    console.error("Deallocation failed:", err);
    if (err?.message?.includes("Allocation") || err?.message?.includes("not valid JSON")) {
      setAllocatedMap((prev) => {
        const updated = { ...prev };
        delete updated[userToRemove];
        return updated;
      });
      setShowSuccessAlert(true);
      onSuccess?.();
    } else {
      const message = err?.response?.data?.message || err?.message || "Failed to remove contributor.";
      setErrorMessage(message);
      setShowErrorAlert(true);
    }
  } finally {
    setUserToRemove(null);
  }
};

const cancelDeallocate = () => {
  setShowAlert(false);
  setUserToRemove(null);
};


  const handleSave = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one contributor to allocate.");
      return;
    }
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const assignedById = userInfo?.other_staff_id;

       if (!assignedById) {
        alert("User information is missing. Please login again.");
        return;
      }

    setSaving(true);
    try {
      // Only allocate newly selected users
      for (const userId of selectedUsers) {
        await allocateUsersModalService.allocateUsers({
          cycle_sub_category_id: parseInt(criteriaId),
          contributor_id: parseInt(userId),
          assigned_by_id: assignedById,
          remarks: "Allocated via modal",
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Allocation failed:", err);
      alert("Failed to allocate contributors.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Delete"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={confirmDeallocate}
          onCancel={cancelDeallocate}
        >
          Remove this contributor from this section?
        </SweetAlert>
      )}

      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          Allocation permanently deleted
        </SweetAlert>
      )}

      {showErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setShowErrorAlert(false)}
        >
          {errorMessage}
        </SweetAlert>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-[#2163c1] text-white px-8 py-6">
          <h2 className="text-2xl font-bold">Manage Contributors</h2>
          <p className="text-indigo-100 mt-1">Add new or remove existing contributors</p>
        </div>

        {/* Body */}
        <div className="p-8 max-h-96 overflow-y-auto">
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contributors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2163c1] outline-none"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader className="animate-spin w-10 h-10 text-[#2163c1] mx-auto" />
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No users found.</p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const isAllocated = allocatedMap.hasOwnProperty(user.id);
                const isSelected = selectedUsers.includes(user.id);

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all
                      ${isAllocated
                        ? "border-green-500 bg-green-50"
                        : isSelected
                        ? "border-[#2163c1] bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      } ${isAllocated ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div
                      className="flex items-center gap-4 flex-1"
                      onClick={() => !isAllocated && toggleSelectForAllocation(user.id)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2163c1] to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow">
                        {user.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    {isAllocated ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">
                          Allocated
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeallocate(user.id);
                          }}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    ) : isSelected ? (
                      <Check className="w-6 h-6 text-[#2163c1]" />
                    ) : (
                      <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                        <Check className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-5 flex justify-between items-center border-t">
          <p className="text-sm text-gray-600">
            <strong>{selectedUsers.length}</strong> new contributor{selectedUsers.length !== 1 ? "s" : ""} to allocate
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || selectedUsers.length === 0}
              className="px-8 py-3 rounded-xl text-white font-semibold bg-[#2163c1] flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition shadow-lg"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin w-5 h-5" />
                  Saving...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Allocate Selected ({selectedUsers.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AllocateUsersModal;