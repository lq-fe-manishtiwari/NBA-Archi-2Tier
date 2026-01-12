// src/screens/pages/NEWNBA/Components/GenericCardWorkflow.jsx

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const GenericCardWorkflow = ({
  cycleSubCategoryId,
  cardData = [],
  onCardClick,
  onStatusChange,
  apiService,
  cardConfig = {
    title: "Entry",
    statusField: "approval_status",
    userField: "other_staff_id",
    nameFields: ["firstname", "lastname"],
    idField: "id",
    isCoordinatorField: "is_coordinator_entry"
  },
  isSubCoordinator = false
}) => {
  const [currentUserInfo, setCurrentUserInfo] = useState({});
  const [actualIsSubCoordinator, setActualIsSubCoordinator] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
    
    
    const currentStaffId = userInfo?.rawData?.other_staff_id ||
                          userInfo.user_id ||
                          userInfo2?.other_staff_id ||
                          userInfo2?.user_id;
    
    // Determine actual user type from localStorage, not just from props
    const isActualSubCoordinator = !!(
      userInfo2.nba_sub_coordinator ||
      userInfo.nba_sub_coordinator
    );
    
    
    setActualIsSubCoordinator(isActualSubCoordinator);
    setCurrentUserInfo({
      staffId: currentStaffId,
      isSubCoordinator: isActualSubCoordinator,
      ...userInfo,
      ...userInfo2
    });
  }, []);

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'APPROVED_BY_COORDINATOR': 'bg-green-100 text-green-700',
      'APPROVED_BY_SUB_COORDINATOR': 'bg-green-100 text-green-600',
      'COORDINATORS_DATA': 'bg-green-100 text-green-700',
      'REJECTED_BY_COORDINATOR': 'bg-red-100 text-red-700',
      'REJECTED_BY_SUB_COORDINATOR': 'bg-red-100 text-red-600',
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'SUBMITTED': 'bg-blue-100 text-blue-700',
      'DRAFT': 'bg-gray-100 text-gray-700'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'COORDINATORS_DATA':
        return 'Approved';
      case 'APPROVED_BY_COORDINATOR':
        return 'Approved';
      case 'APPROVED_BY_SUB_COORDINATOR':
        return 'Approved';
      case 'REJECTED_BY_COORDINATOR':
        return 'Rejected';
      case 'REJECTED_BY_SUB_COORDINATOR':
        return 'Rejected';
      case 'PENDING':
        return 'Pending Review';
      default:
        return status;
    }
  };

  const handleChangeStatus = async (cardItem) => {
    const currentStatus = cardItem[cardConfig.statusField] || 'PENDING';
    
    // Check if coordinator has already made a decision - subcoordinators cannot change it
    if (actualIsSubCoordinator && (currentStatus === 'APPROVED_BY_COORDINATOR' || currentStatus === 'REJECTED_BY_COORDINATOR')) {
      await Swal.fire({
        title: "Status can't get change",
        text: 'This is already approved by coordinator.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }
    
    if (currentStatus === 'PENDING') {
      // Show approve/reject options
      const result = await Swal.fire({
        title: 'Review Submission',
        text: 'Do you want to approve or reject this submission?',
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Approve',
        denyButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#16a34a',
        denyButtonColor: '#dc2626'
      });

      if (result.isConfirmed) {
        const approvalStatus = actualIsSubCoordinator ? 'APPROVED_BY_SUB_COORDINATOR' : 'APPROVED_BY_COORDINATOR';
        console.log("🎯 APPROVAL - actualIsSubCoordinator:", actualIsSubCoordinator, "→ Status:", approvalStatus);
        await handleStatusUpdate(cardItem, approvalStatus, 'approval');
      } else if (result.isDenied) {
        const rejectionStatus = actualIsSubCoordinator ? 'REJECTED_BY_SUB_COORDINATOR' : 'REJECTED_BY_COORDINATOR';
        console.log("🎯 REJECTION - actualIsSubCoordinator:", actualIsSubCoordinator, "→ Status:", rejectionStatus);
        await handleStatusUpdate(cardItem, rejectionStatus, 'rejection');
      }
    } else {
      // Determine available status options based on user type
      let statusOptions = [];
      
      console.log("🔄 CYCLING - actualIsSubCoordinator:", actualIsSubCoordinator);
      console.log("🔄 CYCLING - currentStatus:", currentStatus);
      
      if (actualIsSubCoordinator) {
        // Sub-coordinators can only work with their own decisions and PENDING
        statusOptions = ['PENDING', 'APPROVED_BY_SUB_COORDINATOR', 'REJECTED_BY_SUB_COORDINATOR'];
      } else {
        // Coordinators should only cycle through coordinator statuses
        statusOptions = ['PENDING', 'APPROVED_BY_COORDINATOR', 'REJECTED_BY_COORDINATOR'];
      }

      console.log("🔄 CYCLING - statusOptions:", statusOptions);

      const currentIndex = statusOptions.indexOf(currentStatus);
      console.log("🔄 CYCLING - currentIndex:", currentIndex);
      
      if (currentIndex === -1) {
        // Current status not in available options
        if (!actualIsSubCoordinator) {
          // Coordinator can override subcoordinator decisions - show approve/reject options
          console.log("🔄 CYCLING - Coordinator overriding subcoordinator decision");
          
          const result = await Swal.fire({
            title: 'Override Decision',
            text: 'Do you really want to Approve or Reject the contributor submission which is already got approved/rejected by Sub-Coordinator?',
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Approve',
            denyButtonText: 'Reject',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#16a34a',
            denyButtonColor: '#dc2626'
          });

          if (result.isConfirmed) {
            console.log("🎯 COORDINATOR OVERRIDE APPROVAL");
            await handleStatusUpdate(cardItem, 'APPROVED_BY_COORDINATOR', 'approval');
          } else if (result.isDenied) {
            console.log("🎯 COORDINATOR OVERRIDE REJECTION");
            await handleStatusUpdate(cardItem, 'REJECTED_BY_COORDINATOR', 'rejection');
          }
          return;
        }
        
        await Swal.fire({
          title: 'Cannot Change Status',
          text: 'You do not have permission to modify this status.',
          icon: 'warning',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }

      const nextIndex = (currentIndex + 1) % statusOptions.length;
      const newStatus = statusOptions[nextIndex];
      
      console.log("🔄 CYCLING - nextIndex:", nextIndex, "newStatus:", newStatus);

      if (newStatus.includes('REJECTED')) {
        console.log("🎯 CYCLING REJECTION - newStatus:", newStatus);
        await handleStatusUpdate(cardItem, newStatus, 'rejection');
      } else if (newStatus.includes('APPROVED')) {
        console.log("🎯 CYCLING APPROVAL - newStatus:", newStatus);
        await handleStatusUpdate(cardItem, newStatus, 'approval');
      } else {
        console.log("🎯 CYCLING OTHER - newStatus:", newStatus);
        await handleStatusUpdate(cardItem, newStatus, null);
      }
    }
  };

  const handleStatusUpdate = async (cardItem, newStatus, reasonType) => {
    let reason = null;
    
    if (reasonType) {
      const { value: inputReason } = await Swal.fire({
        title: `${reasonType === 'approval' ? 'Approval' : 'Rejection'} Reason`,
        text: `Please provide a reason for ${reasonType}:`,
        input: 'textarea',
        inputPlaceholder: `Enter ${reasonType} reason...`,
        showCancelButton: true,
        confirmButtonText: reasonType === 'approval' ? 'Approve' : 'Reject',
        confirmButtonColor: reasonType === 'approval' ? '#16a34a' : '#dc2626',
        cancelButtonText: 'Cancel'
      });

      reason = inputReason || ''; // Allow empty reason
    }

    try {
      const statusPayload = {
        id: cardItem[cardConfig.idField], // Always send professional_development_id as "id"
        approval_status: newStatus,
        rejection_reason: reason, // Store both approval and rejection reasons in rejection_reason field
        approved_by: currentUserInfo.staffId,
        approved_by_name: `${currentUserInfo.firstName || ''} ${currentUserInfo.lastName || ''}`.trim()
      };

      await apiService.updateCardStatus(statusPayload, currentUserInfo.staffId);
      
      await Swal.fire({
        title: 'Status Updated!',
        text: `Status changed to ${newStatus} successfully!`,
        icon: 'success',
        confirmButtonColor: '#2163c1'
      });
      
      // Trigger refresh
      onStatusChange?.(cardItem, newStatus);
    } catch (error) {
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to change status',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  if (!cardData || cardData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <i className="fa-solid fa-inbox text-3xl text-gray-400"></i>
        </div>
        <p className="text-lg text-gray-600">No entries found.</p>
        <p className="text-sm text-gray-500 mt-2">Data will appear here once submitted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {cardConfig.title} Entries - Click to Review
      </h4>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cardData.map((cardItem, i) => {
          const userStaffId = cardItem[cardConfig.userField];
          const userName = cardConfig.nameFields.length === 2
            ? `${cardItem[cardConfig.nameFields[0]] || ''} ${cardItem[cardConfig.nameFields[1]] || ''}`.trim()
            : cardItem[cardConfig.nameFields[0]] || `User ${userStaffId}`;
          
          const currentStatus = cardItem[cardConfig.statusField] || 'PENDING';
          const isCurrentUserEntry = userStaffId === currentUserInfo.staffId;
          const isCoordinatorEntry = cardItem[cardConfig.isCoordinatorField];

          return (
            <div
              key={`card-${i}`}
              onClick={() => {
                onCardClick?.(cycleSubCategoryId, userStaffId, cardItem);
              }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                    {userName?.[0]?.toUpperCase()}{userName?.split(' ')[1]?.[0]?.toUpperCase() || ''}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{userName}</span>
                    {isCurrentUserEntry && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
                {!isCurrentUserEntry && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(currentStatus)}`}>
                    {getStatusDisplayText(currentStatus)}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                {cardConfig.title} 
             
              </div>

              {/* Show approval/rejection reasons */}
              {cardItem.rejection_reason && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium text-gray-700 mb-1">
                    {(currentStatus === 'APPROVED_BY_COORDINATOR' || currentStatus === 'APPROVED_BY_SUB_COORDINATOR') ? 'Approval Reason:' : 'Rejection Reason:'}
                  </div>
                  <div className="text-gray-600">
                    {cardItem.rejection_reason}
                  </div>
                </div>
              )}
              
              {cardItem ? (
                <div className="space-y-2">
                  {/* Hide status button for coordinator's own entries and COORDINATORS_DATA status */}
                  {!isCoordinatorEntry && !isCurrentUserEntry && currentStatus !== 'COORDINATORS_DATA' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(cardItem);
                      }}
                      className={`w-full px-3 py-2 text-white text-sm font-medium rounded transition-colors ${
                        (currentStatus === 'APPROVED_BY_COORDINATOR' || currentStatus === 'APPROVED_BY_SUB_COORDINATOR') ? 'bg-green-600 hover:bg-green-700' :
                        (currentStatus === 'REJECTED_BY_COORDINATOR' || currentStatus === 'REJECTED_BY_SUB_COORDINATOR') ? 'bg-red-600 hover:bg-red-700' :
                        'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                    >
                      {(currentStatus === 'APPROVED_BY_COORDINATOR' || currentStatus === 'APPROVED_BY_SUB_COORDINATOR') ? 'Approved' :
                       (currentStatus === 'REJECTED_BY_COORDINATOR' || currentStatus === 'REJECTED_BY_SUB_COORDINATOR') ? 'Rejected' :
                       'Pending Review'}
                    </button>
                  )}
                  

                  
                  <div className="text-xs text-gray-500 text-center">
                    {isCoordinatorEntry || isCurrentUserEntry || currentStatus === 'COORDINATORS_DATA' ?
                      "Coordinator Entry" :
                      "Click status to change"
                    }
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic text-center">
                  No submission yet
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenericCardWorkflow;