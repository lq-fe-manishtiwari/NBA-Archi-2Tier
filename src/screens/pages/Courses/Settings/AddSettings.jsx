import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { courseService } from "../Services/courses.service";

// ✅ Reusable Form Field Component
const InputField = ({ label, name, value, onChange, placeholder, required }) => (
    <div className="mb-4">
        <label className="block font-medium mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300"
        />
    </div>
);

export default function AddSettings() {
    const navigate = useNavigate();    
    const [animate, setAnimate] = useState(false);
    const { type } = useParams(); // e.g. /courses/settings/add/:type
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState({ name: "", code: "", description: "" });
    const [errors, setErrors] = useState({});

    console.log("type from params", type);
    // ✅ Page Title based on type
    const titles = {
        "paper-type": "Paper Type",
        "vertical-number": "Vertical Number",
        "subject-mode": "Subject Mode",
        "specialization": "Specialization",
    };
    const pageTitle = titles[type] || "Add Settings";
    useEffect(() => setAnimate(true), []);

    // ✅ Validation
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (type !== "subject-mode" && !formData.code.trim()) newErrors.code = "Code is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            name: formData.name,
            code: formData.code || null,
            description: formData.description,
        };

        try {
            setLoading(true);

            // ✅ Choose API based on type
            let res;
            if (type === "paper-type") res = await courseService.savePaperType(payload);
            else if (type === "vertical-number") res = await courseService.saveVerticalNumber(payload);
            else if (type === "subject-mode") res = await courseService.saveSubjectMode(payload);
            else if (type === "specialization") res = await courseService.saveSpecialization(payload);

            if (res) {
                setAlert(
                    <SweetAlert
                        success
                        title="Added Successfully!"
                        onConfirm={() => {
                            setAlert(null);
                            navigate(`/courses/settings/${type}`);
                        }}
                        confirmBtnCssClass="btn-confirm"
                    >
                        {`${pageTitle} has been added successfully.`}
                    </SweetAlert>
                );
            }
        } catch (error) {
            console.error("Save Error:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    Failed to save. Please try again.
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate(`/courses/settings/${type}`);

    return (
        <div className="w-full min-h-screen bg-white p-4 sm:p-6 flex justify-center">
            <div className={`w-full sm:max-w-4xl bg-white rounded-2xl shadow-md border border-gray-100 p-6 transform transition-all duration-500 ease-out ${animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
                    }`}>
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    ×
                </button>
                <h2 className="text-2xl font-semibold mb-6 text-blue-700">Add {pageTitle}</h2>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <InputField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter Name"
                        required
                    />
                    {errors.name && <p className="text-red-500 text-sm -mt-3 mb-3">{errors.name}</p>}


                    <>
                        <InputField
                            label="Code"
                            name="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Enter Code"
                            required
                        />
                        {errors.code && <p className="text-red-500 text-sm -mt-3 mb-3">{errors.code}</p>}
                    </>

                    <div className="mb-4">
                        <label className="block font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter Description (optional)"
                            className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300"
                            rows={3}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
            {alert}
        </div>
    );
}
