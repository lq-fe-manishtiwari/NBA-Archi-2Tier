import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authenticationService } from '../_services/api';

const UserProfileContext = createContext();

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract main profile details from API response
  const extractProfileDetails = (apiResponse) => {
    if (!apiResponse) return null;

    return {
      // Personal Information
      firstName: apiResponse.firstname || '',
      lastName: apiResponse.lastname || '',
      middleName: apiResponse.middlename || '',
      fullName: `${apiResponse.firstname || ''} ${apiResponse.middlename || ''} ${apiResponse.lastname || ''}`.trim(),
      email: apiResponse.email || '',
      mobile: apiResponse.mobile || '',
      phone: apiResponse.phone || '',
      
      // Professional Information
      employeeId: apiResponse.employee_id || '',
      staffCode: apiResponse.staff_code || '',
      designation: apiResponse.designation || '',
      dateOfJoining: apiResponse.date_of_joining || '',
      
      // Personal Details
      dateOfBirth: apiResponse.date_of_birth || '',
      gender: apiResponse.gender || '',
      bloodGroup: apiResponse.blood_group || '',
      maritalStatus: apiResponse.marital_status || '',
      fatherName: apiResponse.father_name || '',
      spouseName: apiResponse.spouse_name || '',
      
      // Address Information
      addressLine1: apiResponse.address_line1 || '',
      addressLine2: apiResponse.address_line2 || '',
      city: apiResponse.city || '',
      state: apiResponse.state || '',
      country: apiResponse.country || '',
      pincode: apiResponse.pincode || '',
      
      // Financial Information
      panNumber: apiResponse.pan_number || '',
      aadharNumber: apiResponse.aadhar_number || '',
      uanNumber: apiResponse.uan_number || '',
      bankAccountNo: apiResponse.bank_account_no || '',
      bankName: apiResponse.bank_name || '',
      ifscCode: apiResponse.ifsc_code || '',
      
      // System Information
      userId: apiResponse.school_user_id || apiResponse.user?.user_id || '',
      userType: apiResponse.user?.user_type || '',
      username: apiResponse.user?.username || '',
      isActive: apiResponse.user?.active || false,
      roles: apiResponse.user?.roles || [],
      authorities: apiResponse.user?.authorities || [],
      
      // Department Information
      department: apiResponse.school_department || null,
      
      // Access Attributes
      staffAccessAttributes: apiResponse.staff_access_attributes || [],
      
      // Additional Information
      avatar: apiResponse.avatar || null,
      financialYear: apiResponse.financial_year || '',
      isGuard: apiResponse.is_guard || false,
      isInstitute: apiResponse.institute || false,
      naacContributor: apiResponse.naac_contributor || false,
      naacCoordinator: apiResponse.naac_coordinator || false,
      nba: apiResponse.nba || false,
      
      // Timestamps
      createdDate: apiResponse.createddate || '',
      updatedDate: apiResponse.updateddate || '',
      
      // Raw data for reference
      rawData: apiResponse
    };
  };

  // Fetch profile data from API
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticationService.getProfile();
      console.log('Profile API Response:', response);
      
      const extractedProfile = extractProfileDetails(response);
      setProfileData(extractedProfile);
      
      // Save to localStorage
      if (extractedProfile) {
        localStorage.setItem('userProfile', JSON.stringify(extractedProfile));
      }
      
      return extractedProfile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  // Update profile data
  const updateProfile = (newProfileData) => {
    const updatedProfile = { ...profileData, ...newProfileData };
    setProfileData(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };

  // Clear profile data
  const clearProfile = () => {
    setProfileData(null);
    setError(null);
    localStorage.removeItem('userProfile');
  };

  // Save to localStorage whenever profileData changes
  useEffect(() => {
    if (profileData) {
      localStorage.setItem('userProfile', JSON.stringify(profileData));
    }
  }, [profileData]);

  const value = {
    profileData,
    loading,
    error,
    fetchProfile,
    updateProfile,
    clearProfile,
    // Convenience getters for commonly used data
    get fullName() {
      return profileData?.fullName || '';
    },
    get email() {
      return profileData?.email || '';
    },
    get employeeId() {
      return profileData?.employeeId || '';
    },
    get designation() {
      return profileData?.designation || '';
    },
    get userType() {
      return profileData?.userType || '';
    },
    get userRole() {
      return profileData?.authorities[0]?.authority || '';
    },
    get isActive() {
      return profileData?.isActive || false;
    }
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};