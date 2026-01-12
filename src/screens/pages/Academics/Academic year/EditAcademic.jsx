import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AcademicService } from "../Services/Academic.service";

export default function EditAcademic() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [formData, setFormData] = useState({
    academicYear: "",
    startDate: "",
    endDate: "",
    active: true
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const fetchAcademicYear = async () => {
      try {
        setLoading(true);
        console.log("Fetching academic year data for ID:", id);
        
        const academicData = await AcademicService.getAcademicById(id);
        console.log("Raw API Response:", academicData);
        
        // Store raw API data for debugging
        setApiData(academicData);
        
        // Check if data exists and has the expected structure
        if (!academicData) {
          throw new Error("No data received from API");
        }

        // Debug: Check all available fields in the response
        console.log("All fields in API response:", Object.keys(academicData));
        console.log("Year field:", academicData.year);
        console.log("Start date field:", academicData.start_date);
        console.log("End date field:", academicData.end_date);
        console.log("Active field:", academicData.active);
        
        // Check for nested data structure
        if (academicData.data) {
          console.log("Nested data found:", academicData.data);
        }
        
        // Format dates properly for input[type="date"]
        const formatDateForInput = (dateString) => {
          if (!dateString) {
            console.warn("Empty date string provided");
            return "";
          }
          try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
              console.warn("Invalid date:", dateString);
              return "";
            }
            const formatted = date.toISOString().split('T')[0];
            console.log(`Formatted date: ${dateString} -> ${formatted}`);
            return formatted;
          } catch (error) {
            console.error("Error formatting date:", error, dateString);
            return "";
          }
        };

        // Extract data - handle both direct and nested structures
        const data = academicData.data || academicData;
        
        const formattedData = {
          academicYear: data.year || "",
          startDate: formatDateForInput(data.start_date),
          endDate: formatDateForInput(data.end_date),
          active: data.active !== undefined ? data.active : true
        };

        console.log("Final Formatted Data for form:", formattedData);
        
        setFormData(formattedData);
        
      } catch (err) {
        console.error("Failed to fetch Academic Year:", err);
        setErrors({ 
          form: err.message || "Failed to load Academic Year data. Please try again." 
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAcademicYear();
    } else {
      console.error("No ID found in URL parameters");
      setErrors({ form: "Invalid Academic Year ID" });
      setLoading(false);
    }
  }, [id]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    const { academicYear, startDate, endDate } = formData;

    if (!academicYear.trim()) {
      newErrors.academicYear = "Academic Year is required";
    } else if (!/^\d{4}-\d{4}$/.test(academicYear.trim())) {
      newErrors.academicYear = "Academic Year should be in format: YYYY-YYYY";
    }
    
    if (!startDate) {
      newErrors.startDate = "Start Date is required";
    }
    
    if (!endDate) {
      newErrors.endDate = "End Date is required";
    }

    if (startDate && endDate && startDate >= endDate) {
      newErrors.endDate = "End Date must be after Start Date";
    }

    return newErrors;
  };

  // Date format helper - ISO format without time
  const formatDateToISO = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0] + 'T00:00:00Z';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      // Correct payload format as per your API requirement
      const payload = {
        year: formData.academicYear.trim(),
        start_date: formatDateToISO(formData.startDate),
        end_date: formatDateToISO(formData.endDate),
        active: formData.active
      };

      console.log("Updating Academic Year with payload:", payload);

      await AcademicService.updateAcademic(id, payload);
      navigate("/academics/academicyear");
      
    } catch (err) {
      console.error("Failed to update Academic Year:", err);
      setErrors({ 
        form: err.message || "Failed to update Academic Year. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-slide-up">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 max-w-2xl text-center">
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading academic year data...</p>
          <p className="text-sm text-gray-500 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.form && !loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-slide-up">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 max-w-2xl text-center">
          <div className="text-red-500 text-lg mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{errors.form}</p>
          <button
            onClick={() => navigate("/academics/academicyear")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Academic Years
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 animate-slide-up">
      <button
        onClick={() => navigate("/academics/academicyear")}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold z-10"
        type="button"
      >
        ×
      </button>

      <h2 className="text-2xl font-semibold mb-8 text-blue-700 text-center">
        Edit Academic Year
      </h2>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit} noValidate>
          {/* Academic Year */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 2024-2025"
              value={formData.academicYear}
              onChange={(e) => handleInputChange("academicYear", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.academicYear ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={submitting}
            />
            {errors.academicYear && (
              <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.startDate ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={submitting}
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.endDate ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={submitting}
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
            )}
          </div>

          {/* Active Status */}
          {/* <div className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange("active", e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={submitting}
              />
              <span className="text-sm font-medium text-gray-700">Active Academic Year</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {formData.active 
                ? "This academic year is currently active" 
                : "This academic year is inactive"
              }
            </p>
          </div> */}

          {/* Enhanced Debug Info */}
          {/* <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Debug Info:</strong> ID: {id} | Year: {formData.academicYear} | Start: {formData.startDate} | End: {formData.endDate} | Active: {formData.active.toString()}
            </p>
            {apiData && (
              <details className="text-xs">
                <summary className="cursor-pointer">Raw API Data</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                  {JSON.stringify(apiData, null, 2)}
                </pre>
              </details>
            )}
          </div> */}

          {/* Form error message */}
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.form}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/academics/academicyear")}
              className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Academic Year"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}