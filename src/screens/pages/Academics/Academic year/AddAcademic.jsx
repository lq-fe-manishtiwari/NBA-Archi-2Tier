import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AcademicService } from "../Services/Academic.service";

export default function AddAcademic() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    academicYear: "",
    startDate: "",
    endDate: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
        start_date: formatDateToISO(formData.startDate), // Format: "2024-06-01T00:00:00Z"
        end_date: formatDateToISO(formData.endDate),     // Format: "2025-05-31T00:00:00Z"
        active: true
      };

      console.log("Sending payload:", payload); // Debug ke liye

      await AcademicService.saveAcademic(payload);
      navigate("/academics/academicyear");
      
    } catch (err) {
      console.error("Failed to save Academic Year:", err);
      setErrors({ 
        form: err.message || "Failed to save Academic Year. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  };

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
        Add New Academic Year
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
          <div className="mb-6">
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
                  Saving...
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}