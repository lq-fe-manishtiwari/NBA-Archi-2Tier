import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { collegeService } from "../screens/pages/Academics/Services/college.service";
import { useUserProfile } from "./UserProfileContext";

const CollegeContext = createContext();

export const useColleges = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error("useColleges must be used within a CollegeProvider");
  }
  return context;
};

export const CollegeProvider = ({ children }) => {
  const { profileData } = useUserProfile();

  // Load cached colleges first
  const [colleges, setColleges] = useState(() => {
    const saved = localStorage.getItem("colleges");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔒 Prevent repeated API fetches
  const hasFetchedRef = useRef(false);

  // 🌐 Fetch colleges (runs ONCE unless forced)
const fetchColleges = useCallback(
  async (forceRefresh = false) => {
    if (!profileData) return;
   console.log("🔍 Fetching colleges...",profileData);
    // Avoid repeated API calls unless forced
    if (hasFetchedRef.current && !forceRefresh) {
      console.log("⛔ Skipping API call — already fetched once");
      return colleges;
    }

    hasFetchedRef.current = true; // Mark fetch as done

    setLoading(true);
    setError(null);

    try {
      let data = [];
      const role = profileData?.roles?.[0]?.name?.toUpperCase();
      const userId = profileData?.userId;
      console.log("profileDataredtfygbnjmk",profileData)
      const userId2 = profileData?.rawData?.other_staff_id;

      console.log("👤 User Role:", role, "User ID:", userId);

      if (role === "SUPERADMIN") {
        data = await collegeService.getAllColleges();
      } else if (role === "ADMIN" && userId) {
        data = await collegeService.getAllCollegesByUser(userId2);
      } else {
        console.warn(`⚠️ Unknown role: ${role}`);
        data = [];
      }

      setColleges(data);
      localStorage.setItem("colleges", JSON.stringify(data));

      console.log("✅ Colleges fetched:", data);
      return data;
    } catch (err) {
      console.error("❌ Error fetching colleges:", err);
      setError(err.message || "Failed to fetch colleges");
      return [];
    } finally {
      setLoading(false);
    }
  },
  [profileData, colleges]
);


  // 🔄 Force refresh colleges after a change
  const refreshColleges = useCallback(async () => {
    console.log("🔁 Force-refreshing colleges...");
    hasFetchedRef.current = false; // allow re-fetch
    return fetchColleges(true);
  }, [fetchColleges]);

  // 🔁 Auto-fetch ONCE when profile is ready
  useEffect(() => {
    if (profileData && !hasFetchedRef.current) {
      fetchColleges();
    }
  }, [profileData, fetchColleges]);

  const value = {
    colleges,
    loading,
    error,
    fetchColleges,
    refreshColleges,
    setColleges,
  };

  return (
    <CollegeContext.Provider value={value}>
      {children}
    </CollegeContext.Provider>
  );
};
