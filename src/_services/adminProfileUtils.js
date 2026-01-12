// src/_services/adminProfileUtils.js
import { adminProfileService } from './adminProfile';

// Global storage for admin profile data
let globalAdminProfile = null;
let globalProfileFlags = {
  isCoordinator: false,
  isSubCoordinator: false,
  isContributor: false,
  staffAccess: {},
  adminProfile: null
};

// Initialize admin profile and extract flags
export const initializeAdminProfile = async () => {
  try {
    const adminProfile = await adminProfileService.getProfile();
    globalAdminProfile = adminProfile;
    
    // Extract coordinator, sub-coordinator, and contributor from adminProfile
    const isCoordinator = adminProfile.is_coordinator || false;
    const isSubCoordinator = adminProfile.is_sub_coordinator || false;
    const isContributor = adminProfile.is_contributor || false;
    
    // Also check staff_access_attributes for additional access info
    const staffAccess = adminProfile.staff_access_attributes?.[0] || {};
    const coordinatorAccess = staffAccess.coordinator === "true";
    const subCoordinatorAccess = staffAccess.subcoordinator === "true";
    const contributorAccess = staffAccess.contributor === "true";
    
    // Update global flags
    globalProfileFlags = {
      isCoordinator: isCoordinator || coordinatorAccess,
      isSubCoordinator: isSubCoordinator || subCoordinatorAccess,
      isContributor: isContributor || contributorAccess,
      staffAccess: staffAccess,
      adminProfile: adminProfile
    };
    
    return globalProfileFlags;
  } catch (error) {
    console.error('Failed to initialize admin profile:', error);
    return globalProfileFlags;
  }
};

// Get coordinator status - can be called from any component
export const getCoordinatorStatus = () => {
  return {
    isCoordinator: globalProfileFlags.isCoordinator,
    isSubCoordinator: globalProfileFlags.isSubCoordinator,
    isContributor: globalProfileFlags.isContributor
  };
};

// Get full staff access - can be called from any component
export const getStaffAccess = () => {
  return globalProfileFlags.staffAccess;
};

// Get full admin profile - can be called from any component
export const getAdminProfile = () => {
  return globalProfileFlags.adminProfile;
};

// Check if user is coordinator
export const isUserCoordinator = () => {
  return globalProfileFlags.isCoordinator;
};

// Check if user is sub-coordinator
export const isUserSubCoordinator = () => {
  return globalProfileFlags.isSubCoordinator;
};

// Check if user is contributor
export const isUserContributor = () => {
  return globalProfileFlags.isContributor;
};

// Get specific staff access permission
export const hasStaffAccess = (accessType) => {
  return globalProfileFlags.staffAccess[accessType] === "true";
};

// Export all flags at once
export const getAllProfileFlags = () => {
  return globalProfileFlags;
};