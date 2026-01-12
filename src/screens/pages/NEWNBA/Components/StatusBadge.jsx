import React from 'react';

const StatusBadge = ({ status, rejectionReason, approvalReason, approvedByName, className = "" }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED_BY_COORDINATOR':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: 'fa-check-circle',
          label: 'Approved'
        };
      case 'APPROVED_BY_SUB_COORDINATOR':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          icon: 'fa-check-circle',
          label: 'Approved'
        };
      case 'REJECTED_BY_COORDINATOR':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: 'fa-times-circle',
          label: 'Rejected'
        };
      case 'REJECTED_BY_SUB_COORDINATOR':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          icon: 'fa-times-circle',
          label: 'Rejected'
        };
      case 'PENDING':
      default:
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: 'fa-clock',
          label: 'Pending Review'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>

      <h4 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Approval Status</h4>

      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
        <i className={`fa-solid ${config.icon}`}></i>
        <span>{config.label}</span>
      </div>

      {(status === 'REJECTED_BY_COORDINATOR' || status === 'REJECTED_BY_SUB_COORDINATOR') && rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm w-full text-right" style={{ float: 'right' }}>
          <span className="font-medium text-red-800">Reason:</span>
          <span className="text-red-700 ml-1">{rejectionReason}</span>
        </div>
      )}

      {(status === 'APPROVED_BY_COORDINATOR' || status === 'APPROVED_BY_SUB_COORDINATOR') && approvalReason && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm w-full text-right">
          <span className="font-medium text-green-800">Reason:</span>
          <span className="text-green-700 ml-1">{approvalReason}</span>
        </div>
      )}



      {(status === 'APPROVED_BY_COORDINATOR' || status === 'REJECTED_BY_COORDINATOR' ||
        status === 'APPROVED_BY_SUB_COORDINATOR' || status === 'REJECTED_BY_SUB_COORDINATOR') && approvedByName && (
        <div className="text-xs text-gray-600 whitespace-nowrap">
          {(status === 'APPROVED_BY_COORDINATOR' || status === 'APPROVED_BY_SUB_COORDINATOR') ? 'Approved' : 'Rejected'} by: {approvedByName}
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
