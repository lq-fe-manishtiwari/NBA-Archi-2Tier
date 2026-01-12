import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";

export default function AddNewCourse() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    vertical: "",
    code: "",
    credits: "",
    color: "#1D4ED8",
    mode: "",
    specialization: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => setAnimate(true), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Course Name is required";
    if (!formData.type.trim()) newErrors.type = "Course Type is required";
    if (!formData.vertical.trim()) newErrors.vertical = "Vertical Type is required";
    if (!formData.code.trim()) newErrors.code = "Course Code is required";
    if (!formData.credits) newErrors.credits = "Credits are required";
    if (!formData.color) newErrors.color = "Color Code is required";
    if (!formData.mode.trim()) newErrors.mode = "Course Mode is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    navigate("/academics/course");
  };

  return (
    <div className="w-full min-h-screen bg-white sm:bg-white p-3 sm:p-6 flex justify-center">
      <div
        className={`w-full sm:max-w-4xl bg-white rounded-2xl shadow-md border border-gray-100 p-6 transform transition-all duration-500 ease-out ${
          animate ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-95"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => navigate("/academics/course")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-blue-700 text-center sm:text-left">
          Add New Course
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            ["Course Name", "name", "text"],
            ["Course Type", "type", "text"],
            ["Vertical Type", "vertical", "text"],
            ["Course Code", "code", "text"],
            ["Credits", "credits", "number"],
          ].map(([label, name, type]) => (
            <div key={name} className="col-span-1 sm:col-span-2">
              <label className="block font-medium mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
            </div>
          ))}

          {/* Color Code */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block font-medium mb-1">Color Code</label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-16 h-10 border rounded cursor-pointer"
            />
          </div>

          {/* Course Mode */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block font-medium mb-1">Course Mode</label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none ${
                errors.mode ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Mode</option>
              <option value="Theory">Theory</option>
              <option value="Practical">Practical</option>
            </select>
            {errors.mode && <p className="text-red-500 text-sm mt-1">{errors.mode}</p>}
          </div>

          {/* Specialization (Optional) */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block font-medium mb-1">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300"
            />
          </div>

          {/* Buttons */}
          <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowCancelAlert(true)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Save
            </button>
          </div>
        </form>

        {/* Cancel Alert */}
        {showCancelAlert && (
          <SweetAlert
            warning
            showCancel
            title="Are you sure?"
            onConfirm={() => navigate("/academics/course")}
            onCancel={() => setShowCancelAlert(false)}
            confirmBtnText="OK"
            cancelBtnText="Cancel"            
            confirmBtnCssClass="btn-confirm"
            cancelBtnCssClass="btn-cancel"
          >
            Your data will be lost if you leave this page.
          </SweetAlert>
        )}
      </div>
    </div>
  );
}
