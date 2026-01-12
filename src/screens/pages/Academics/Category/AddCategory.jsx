import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryService } from "../Services/Category.service";
import { collegeService } from "../Services/college.service"; // FIXED IMPORT

export default function AddCategory() {
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch colleges
  useEffect(() => {
    collegeService
      .getAllColleges()
      .then((res) => {
        console.log("COLLEGES >>>", res);

        setColleges(res);

        if (res.length) setCollegeId(res[0].id);
      })
      .catch(() => {
        setErrors({ form: "Failed to load colleges." });
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!categoryName.trim()) newErrors.categoryName = "Category Name is required";
    if (!collegeId) newErrors.collegeId = "Select a college";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    const payload = {
      college_id: Number(collegeId),
      category_name: categoryName,
    };

    CategoryService.saveCategory(payload)
      .then(() => navigate("/academics/category"))
      .catch(() => setErrors({ form: "Failed to add category. Please try again." }))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-slide-up bg-white rounded-2xl shadow-md relative">
      <button
        onClick={() => navigate("/academics/category")}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
      >
        ×
      </button>

      <h2 className="text-2xl font-semibold mb-6 text-blue-700">Add College Category</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* College Dropdown */}
        <div>
          <label className="block font-medium mb-1">Select College</label>
          <select
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className={`w-full border rounded px-3 py-2 ${
              errors.collegeId ? "border-red-500" : "border-gray-300"
            }`}
          >
            {colleges.length === 0 && <option>Loading...</option>}

            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.college_name}
              </option>
            ))}
          </select>

          {errors.collegeId && (
            <p className="text-red-500 text-sm mt-1">{errors.collegeId}</p>
          )}
        </div>

        {/* Category Name */}
        <div>
          <label className="block font-medium mb-1">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className={`w-full border rounded px-3 py-2 ${
              errors.categoryName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.categoryName && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryName}</p>
          )}
        </div>

        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/academics/category")}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
