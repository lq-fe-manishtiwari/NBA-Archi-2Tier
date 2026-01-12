// src/screens/pages/NEWNBA/Components/AllocateSubCoordinator.jsx

import React, { useState, useEffect } from "react";
import { Search, Loader, Check, UserPlus, X } from "lucide-react";
// import Swal from "sweetalert2";
import { allocateUsersModalService } from "../Services/AllocateSubCoordinator.service";

const AllocateSubCoordinator = ({
  isOpen,
  onClose,
  criteriaId, // This is cycle_category_id
  criterionName = "Criterion",
  academicYear,
  currentAllocated = [],
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); // New selections only
  const [allocatedMap, setAllocatedMap] = useState({}); // userId → allocation_id
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---------------- Load Data on Open ---------------- */
  useEffect(() => {
    if (isOpen) {
      loadCurrentAllocations();
      fetchAvailableUsers();
    } else {
      // Reset state when closed
      setSearchTerm("");
      setSelectedUsers([]);
    }
  }, [isOpen, currentAllocated]);

  const loadCurrentAllocations = () => {
    const map = {};
    
    console.log("🔍 DEBUG: Processing currentAllocated:", currentAllocated);
    
    // Handle new API response structure - currentAllocated is array of users from ViewNBAPartBOptimized
    if (Array.isArray(currentAllocated)) {
      currentAllocated.forEach((item) => {
        console.log("🔍 DEBUG: Processing allocation item:", item);
        
        // Handle direct user objects (from ViewNBAPartBOptimized.jsx)
        if (item.school_user && item.nba_sub_coordinator_allocation_id) {
          const userId = item.school_user.school_user_id;
          const allocationId = item.nba_sub_coordinator_allocation_id;
          
          if (userId && allocationId) {
            map[userId] = allocationId;
            console.log(`✅ DEBUG: Mapped user ${userId} to allocation ${allocationId}`);
          }
        }
        // Handle new API structure with sub_coordinators array (if passed directly)
        else if (item.sub_coordinators && Array.isArray(item.sub_coordinators)) {
          item.sub_coordinators.forEach((subCoord) => {
            const userId = subCoord.sub_coordinator_id;
            const allocationId = subCoord.allocation_id;
            
            if (userId && allocationId) {
              map[userId] = allocationId;
              console.log(`✅ DEBUG: Mapped sub-coordinator ${userId} to allocation ${allocationId}`);
            }
          });
        }
        // Handle old structure for backward compatibility
        else {
          const userId = item.school_user?.otherStaffId ||
                        item.school_user?.other_staff_id ||
                        item.school_user?.school_user_id ||
                        item.otherStaffId ||
                        item.other_staff_id ||
                        item.school_user_id ||
                        item.staff_id ||
                        item.sub_coordinator_id;
          
          const allocationId = item.nba_sub_coordinator_allocation_id ||
                              item.allocation_id ||
                              item.id;
          
          if (userId && allocationId) {
            map[userId] = allocationId;
            console.log(`✅ DEBUG: Mapped legacy user ${userId} to allocation ${allocationId}`);
          }
        }
      });
    }
    
    console.log("🎯 DEBUG: Final allocation map:", map);
    setAllocatedMap(map);
    setSelectedUsers([]); // Reset selections
  };

  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const users = await allocateUsersModalService.getAllUsers();
      console.log("🔍 DEBUG: Fetched available users:", users);

      const mappedUsers = users.map((u) => {
        // Ensure consistent ID mapping - use the same logic as allocation mapping
        const userId = u.otherStaffId || u.other_staff_id || u.sub_coordinator_id || u.school_user_id;
        
        return {
          id: userId,
          name: `${u.firstname || ""} ${u.lastname || ""}`.trim() ||
                u.sub_coordinator_name ||
                "Unnamed User",
          email: u.email || "No email",
          department: u.department || "",
          mobile: u.mobile || "",
          avatar: `${(u.firstname?.[0] || u.sub_coordinator_name?.[0] || "?")}${(u.lastname?.[0] || u.sub_coordinator_name?.split(' ')[1]?.[0] || "?")}`.toUpperCase(),
        };
      });

      console.log("🎯 DEBUG: Mapped available users:", mappedUsers);
      setAvailableUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: "Could not fetch the list of sub-coordinators. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Search & Filtering ---------------- */
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------------- Toggle Selection ---------------- */
  const toggleSelectForAllocation = (userId) => {
    if (allocatedMap[userId]) {
      return; // Cannot reselect allocated
    }
    
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  /* ---------------- Deallocate Existing ---------------- */
  const handleDeallocate = async (userId) => {
    const allocationId = allocatedMap[userId];
    
    console.log("🔍 DEBUG: Attempting to deallocate user:", userId, "with allocation ID:", allocationId);
    
    if (!allocationId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cannot find allocation ID for this user.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Remove this sub-coordinator from this criterion?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("📡 DEBUG: Calling deAllocateSubCoordinator API with ID:", allocationId);
      await allocateUsersModalService.deAllocateSubCoordinator(allocationId);

      setAllocatedMap((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      
      Swal.fire("Removed!", "Sub-coordinator has been removed successfully.", "success");
      
      // Call onSuccess to refresh parent component data
      if (onSuccess) {
        console.log("🔄 DEBUG: Calling onSuccess to refresh parent data");
        onSuccess();
      }
    } catch (err) {
      console.error("❌ DEBUG: Deallocation failed:", err);
      // Handle cases where API returns plain text ("Allocation permanently deleted")
      // which causes a JSON parsing error in the API service layer.
      if (err instanceof SyntaxError && err.message.includes("is not valid JSON")) {
        console.warn("⚠️ WARN: Caught a JSON parsing error, likely from a text response on successful deallocation. Treating as success.");
        Swal.fire("Removed!", "Sub-coordinator has been removed successfully.", "success");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Deallocation Failed",
          text: err.message || "Failed to remove sub-coordinator. Please try again.",
        });
      }
    }
  };

  /* ---------------- Save New Allocations ---------------- */
  const handleSave = async () => {
    if (selectedUsers.length === 0) {
      Swal.fire("No Selection", "Please select at least one sub-coordinator to allocate.", "warning");
      return;
    }

    console.log("🔍 DEBUG: Starting allocation for users:", selectedUsers);
    console.log("🔍 DEBUG: Criteria ID:", criteriaId);

    setSaving(true);
    try {
      for (const userId of selectedUsers) {
        const payload = {
          cycle_category_id: parseInt(criteriaId),
          sub_coordinator_ids: [parseInt(userId)],
          contributor_id: "", // Explicitly empty as per your backend
          assigned_by_id: 20,
          remarks: "Allocated as Sub-Coordinator via modal",
        };
        
        console.log("📡 DEBUG: Allocating user with payload:", payload);
        await allocateUsersModalService.allocateUsers(payload);
        console.log("✅ DEBUG: Successfully allocated user:", userId);
      }

      Swal.fire(
        "Allocated!",
        `Successfully allocated ${selectedUsers.length} sub-coordinator(s)!`,
        "success"
      );
      
      // Call onSuccess to refresh parent data
      if (onSuccess) {
        console.log("🔄 DEBUG: Calling onSuccess to refresh parent data");
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error("❌ DEBUG: Allocation failed:", err);
      Swal.fire({
        icon: "error",
        title: "Allocation Failed",
        text: err.message || "Failed to allocate sub-coordinators. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-[#2163c1] text-white px-8 py-6">
          <h2 className="text-2xl font-bold">Manage Sub-Coordinators</h2>
          <p className="text-indigo-100 mt-1">
            {criterionName} • Add new or remove existing sub-coordinators
          </p>
        </div>

        {/* Body */}
        <div className="p-8 max-h-96 overflow-y-auto">
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sub-coordinators..."
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
                    onClick={() => !isAllocated && toggleSelectForAllocation(user.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2163c1] to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow">
                        {user.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.department && (
                          <p className="text-xs text-gray-400">Dept: {user.department}</p>
                        )}
                        {user.mobile && (
                          <p className="text-xs text-gray-400">Mobile: {user.mobile}</p>
                        )}
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
                        <Check className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
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
            <strong>{selectedUsers.length}</strong> new sub-coordinator{selectedUsers.length !== 1 ? "s" : ""} selected
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
  );
};

export default AllocateSubCoordinator;