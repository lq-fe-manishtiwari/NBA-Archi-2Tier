'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseService } from "../Services/courses.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { X } from 'lucide-react';

export default function EditModule() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subject_id: '',
    module_name: '',
    module_code: '',
  });

  const [errors, setErrors] = useState({});
  const isFetchedRef = useRef(false);

  useEffect(() => setAnimate(true), []);

  // 🧠 Load subjects + module details with better error handling
  useEffect(() => {
    const fetchData = async () => {
      if (isFetchedRef.current) return;

      try {
        isFetchedRef.current = true;

        const [subjectRes, moduleRes] = await Promise.all([
          courseService.getAllCourses(),
          courseService.getModuleById(id),
        ]);

        console.log("📗 Subjects Response:", subjectRes);
        console.log("📘 Module Response:", moduleRes);

        // ✅ Normalize API data with better error handling
        const subjectList = Array.isArray(subjectRes)
          ? subjectRes
          : subjectRes?.data || subjectRes?.result || [];

        setSubjects(subjectList);

        // ✅ Prefill form data with fallbacks
        if (moduleRes) {
          setFormData({
            subject_id: moduleRes.subject?.subject_id || '',
            module_name: moduleRes.name || '',
            module_code: moduleRes.subject?.subject_code || '',
          });
        } else {
          throw new Error('Module not found');
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setAlert(
          <SweetAlert
            danger
            title="Failed to Load Data"
              confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
            onConfirm={() => {
              setAlert(null);
              navigate('/courses/module');
            }}
          >
            Could not load module details. Please try again.
          </SweetAlert>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // ✏️ Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Validate form
  const validate = () => {
    const newErrors = {};
    if (!formData.subject_id) newErrors.subject_id = "Subject is required";
    if (!formData.module_name.trim()) newErrors.module_name = "Module Name is required";
    if (!formData.module_code.trim()) newErrors.module_code = "Module Code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 💾 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await courseService.updateModule(id, formData);

      setAlert(
        <SweetAlert
          success
          title="Module Updated!"
            confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => {
            setAlert(null);
            navigate('/courses/module');
          }}
        >
          {`${formData.module_name} has been updated successfully.`}
        </SweetAlert>
      );
    } catch (error) {
      console.error('Error updating module:', error);
      setAlert(
        <SweetAlert
          danger
          title="Update Failed"
            confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setAlert(null)}
        >
          {error.response?.data?.message || 'Failed to update module. Please try again.'}
        </SweetAlert>
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelAlert(true);
    } else {
      navigate("/courses/module");
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading module details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white p-3 sm:p-6 flex justify-center">
      <div
        className={`w-full sm:max-w-2xl bg-white rounded-2xl shadow-md border border-gray-100 p-6 transform transition-all duration-500 ease-out ${animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-blue-700">
            Edit Module
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* FORM START */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject <span className="text-red-500">*</span>
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.subject_id
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
                }`}
            >
              <option value="">Select Subject</option>
              {subjects.map((subj) => (
                <option key={subj.subject_id} value={subj.subject_id}>
                  {subj.name}
                </option>
              ))}
            </select>
            {errors.subject_id && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <span className="mr-1">⚠</span>
                {errors.subject_id}
              </p>
            )}
          </div>

          {/* Module Name & Code - Side by Side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Module Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="module_name"
                value={formData.module_name}
                onChange={handleChange}
                placeholder="Enter Module Name"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.module_name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                  }`}
              />
              {errors.module_name && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.module_name}
                </p>
              )}
            </div>

            {/* Module Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="module_code"
                value={formData.module_code}
                onChange={handleChange}
                placeholder="Enter Module Code"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.module_code
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                  }`}
              />
              {errors.module_code && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.module_code}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Module'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Cancel Alert */}
      {showCancelAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Leave"
          cancelBtnText="Stay"
          title="Unsaved Changes"
            confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => navigate("/courses/module")}
          onCancel={() => setShowCancelAlert(false)}
        >
          You have unsaved changes. Are you sure you want to leave?
        </SweetAlert>
      )}

      {alert}
    </div>
  );
}