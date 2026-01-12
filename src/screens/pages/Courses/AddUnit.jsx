'use client';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SweetAlert from "react-bootstrap-sweetalert";

export default function AddUnit() {
    const navigate = useNavigate();
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

        setLoading(true);
        try {
            const payload = {
                program_id: formData.program?.value,
  class_year_id: formData.class?.value,
  semester_id: formData.semester?.value,
  batch_id: formData.batch?.value,
                subject_code: "MATH109",
                name: formData.paperName,
                color_code: formData.colorCode,
                // student_limit: formData.studentLimit.toString(),
                paper_code: formData.paperCode,
                specialization_ids: [parseInt(formData.specialization)],
                credits: formData.credits.toString(),
                // start_date_time: formData.startDateTime,
                // end_date_time: formData.endDateTime,
                mode_ids: formData.subjectMode, // from multiselect
                type_ids: [formData.paperType], // assuming single type
                vertical_ids: [formData.vertical], // assuming single vertical
            };

            console.log("Submitting Payload →", payload);

            // const res = await courseService.saveCourse(payload); // ✅ API call

            setAlert(
                <SweetAlert
                    success
                    title="Paper Added!"
                    onConfirm={() => {
                        setAlert(null);
                        navigate("/courses/paper");
                    }}
                    confirmBtnCssClass="btn-confirm"
                >
                    {`${formData.paperName} has been added successfully.`}
                </SweetAlert>
            );
        } catch (error) {
            console.error("Save Course Error:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    Failed to save paper. Please try again.
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=" bg-gray-50 flex justify-center p-2">
            <div className="bg-white shadow-lg rounded-2xl p-2 w-full max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-blue-600">Add Unit</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-600 transition"
                    >
                        ✕
                    </button>
                </div>

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
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
