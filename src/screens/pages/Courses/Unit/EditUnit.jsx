'use client';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ Import this

export default function EditUnit() {
  const navigate = useNavigate(); // ✅ initialize navigate
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
        subject: '',
        module: '',
        unitName: '',
  });

  const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.subject.trim()) newErrors.subject = 'Please select a subject';
        if (!formData.module.trim()) newErrors.module = 'Please select a module';
        if (!formData.unitName.trim()) newErrors.unitName = 'Please enter unit name';

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

  const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        console.log("Form Data Submitted:", formData);
        // TODO: Add API call here
    };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-2xl font-semibold text-blue-600">Edit Unit</h1>
        <button
          type="button"
          onClick={() => navigate(-1)} //  Back navigation
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-600 transition"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>

      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Subject *
                            </label>
                           <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                    errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">Select Subject</option>
                                <option value="Subject 1">Subject 1</option>
                                <option value="Subject 2">Subject 2</option>
                            </select>
                            {errors.subject && (
                                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                            )}
                        </div>
                    </div>

        <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Module*
                            </label>
                             <select
                                name="module"
                                value={formData.module}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                    errors.module ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">Select Module</option>
                                <option value="Module 1">Module 1</option>
                                <option value="Module 2">Module 2</option>
                            </select>
                            {errors.module && (
                                <p className="text-red-500 text-sm mt-1">{errors.module}</p>
                            )}
                            
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unit Name*
                            </label>
                           <input
                                type="text"
                                name="unitName"
                                value={formData.unitName}
                                onChange={handleChange}
                                placeholder="Enter Unit Name"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                    errors.unitName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {errors.unitName && (
                                <p className="text-red-500 text-sm mt-1">{errors.unitName}</p>
                            )}
                        </div>
                    </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
