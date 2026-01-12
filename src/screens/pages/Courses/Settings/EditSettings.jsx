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

export default function EditSettings() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const { type, id } = useParams(); // e.g. /courses/settings/edit/:type/:id
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  const [errors, setErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);

  const isFetchedRef = React.useRef(false);

  // ✅ Page Title based on type
  const titles = {
    "paper-type": "Paper Type",
    "vertical-number": "Vertical Number",
    "subject-mode": "Subject Mode",
    "specialization": "Specialization",
  };
  const pageTitle = titles[type] || "Edit Settings";
  useEffect(() => setAnimate(true), []);

  // ✅ Fetch Existing Data by ID
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setInitialLoading(true);
        let res;

        if (type === "paper-type") res = await courseService.getPaperTypeById(id);
        else if (type === "vertical-number") res = await courseService.getVerticalNumberById(id);
        else if (type === "subject-mode") res = await courseService.getSubjectModeById(id);
        else if (type === "specialization") res = await courseService.getSpecializationById(id);

        if (res) {
          setFormData({
            name: res.name || "",
            code: res.code || "",
            description: res.description || "",
          });
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        setAlert(
          <SweetAlert
            danger
            title="Error"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="btn-confirm"
          >
            Failed to fetch details. Please try again.
          </SweetAlert>
        );
      } finally {
        setInitialLoading(false);
      }
    };

    if (!isFetchedRef.current) {
      fetchDetails();
    isFetchedRef.current = true;
  }
    
  }, [id, type]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (type !== "subject-mode" && !formData.code.trim()) newErrors.code = "Code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Update Handler
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
      let res;

      if (type === "paper-type") res = await courseService.updatePaperType(id, payload);
      else if (type === "vertical-number") res = await courseService.updateVerticalNumber(id, payload);
      else if (type === "subject-mode") res = await courseService.updateSubjectMode(id, payload);
      else if (type === "specialization") res = await courseService.updateSpecialization(id, payload);

      if (res) {
        setAlert(
          <SweetAlert
            success
            title="Updated Successfully!"
            onConfirm={() => {
              setAlert(null);
              navigate(`/courses/settings/${type}`);
            }}
            confirmBtnCssClass="btn-confirm"
          >
            {`${pageTitle} has been updated successfully.`}
          </SweetAlert>
        );
      }
    } catch (error) {
      console.error("Update Error:", error);
      setAlert(
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to update. Please try again.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(`/courses/settings/${type}`);

  if (initialLoading) {
    return <div className="text-center py-20 text-gray-500">Loading details...</div>;
  }

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
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Edit {pageTitle}</h2>

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
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
      {alert}
    </div>
  );
}
