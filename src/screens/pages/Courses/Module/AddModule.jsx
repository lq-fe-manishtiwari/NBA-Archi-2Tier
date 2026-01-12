'use client';

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { courseService } from "../Services/courses.service";
import SweetAlert from "react-bootstrap-sweetalert";

export default function AddModule() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    moduleName: '',
    moduleCode: ''
  });

  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState({ subjects: false, submitting: false });
  const [alert, setAlert] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => setAnimate(true), []);

  // -------------------- Fetch All Subjects --------------------
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(prev => ({ ...prev, subjects: true }));

        // Get all subjects
        const response = await courseService.getAllCourses();

        if (response && Array.isArray(response)) {
          const formattedSubjects = response.map(subject => ({
            label: subject.name || subject.paper_name || subject.subject_name,
            value: subject.subject_id || subject.id,
          }));
          setSubjectOptions(formattedSubjects);
        } else {
          setSubjectOptions([]);
          console.warn("No subjects found or invalid response format");
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setAlert(
          <SweetAlert
            error
            title="Error"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="btn-confirm"
          >
            Failed to load subjects. Please try again.
          </SweetAlert>
        );
        setSubjectOptions([]);
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
      }
    };

    fetchSubjects();
  }, []);

  // -------------------- Handle Input --------------------
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // -------------------- Handle Submit --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.moduleName || !formData.moduleCode) {
      setAlert(
        <SweetAlert
          warning
          title="Missing Fields"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Please fill all required fields before submitting.
        </SweetAlert>
      );
      return;
    }

    setLoading(prev => ({ ...prev, submitting: true }));

    try {
      const payload = {
        subject_id: parseInt(formData.subject),
        module_name: formData.moduleName.trim(),
        module_code: formData.moduleCode.trim(),
        is_deleted: false,
      };

      const response = await courseService.saveModule(payload);
      console.log("Module created successfully:", response);

      // SUCCESS ALERT with navigation - exactly like AddSettings component
      setAlert(
        <SweetAlert
          success
          title="Added Successfully!"
          onConfirm={() => {
            setAlert(null);
            navigate('/courses/module'); 
          }}
          confirmBtnCssClass="btn-confirm"
        >
          Module has been added successfully.
        </SweetAlert>
      );
    } catch (error) {
      console.error("Error creating module:", error);
      setAlert(
        <SweetAlert
          error
          title="Error"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          {error.message || "Failed to create module. Please try again."}
        </SweetAlert>
      );
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  // Cancel Handler - navigate back
  const handleCancel = () => navigate('/courses/module');

  return (
    <div className="w-full min-h-screen bg-white p-4 sm:p-6 flex justify-center">
      <div className={`w-full sm:max-w-4xl bg-white rounded-2xl shadow-md border border-gray-100 p-6 transform transition-all duration-500 ease-out ${
        animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
      }`}>
        
        {/* ✅ Close Button - exactly like AddSettings */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Add Module</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Select Subject */}
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">
              Select Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading.subjects || loading.submitting}
            >
              <option value="">
                {loading.subjects ? "Loading subjects..." : "Select Subject"}
              </option>
              {subjectOptions.map(subject => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
            {subjectOptions.length === 0 && !loading.subjects && (
              <p className="text-red-500 text-sm mt-1">
                No subjects available.
              </p>
            )}
          </div>

          {/* Module Name */}
          <div>
            <label className="block font-medium mb-1">
              Module Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Module Name"
              value={formData.moduleName}
              onChange={(e) => handleInputChange('moduleName', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading.submitting}
            />
          </div>

          {/* Module Code */}
          <div>
            <label className="block font-medium mb-1">
              Module Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Module Code"
              value={formData.moduleCode}
              onChange={(e) => handleInputChange('moduleCode', e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading.submitting}
            />
          </div>

          {/*Buttons - exactly like AddSettings */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.submitting || loading.subjects}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading.submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
      
      {/*Alert - exactly like AddSettings */}
      {alert}
    </div>
  );
}