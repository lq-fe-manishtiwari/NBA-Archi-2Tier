import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SubCategoryService } from "../Services/SubCategory.service";
import { CategoryService } from "../Services/Category.service";

export default function AddSubCategory() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [divisionName, setDivisionName] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- Load Categories ---------------- */
  useEffect(() => {
    CategoryService.getCategory()
      .then((data) => {
        setCategories(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setErrors({ form: "Failed to load categories." });
        setLoading(false);
      });
  }, []);

  /* ---------------- Handle Submit ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!divisionName.trim()) {
      validationErrors.divisionName = "Sub-Category Name is required";
    }
    if (!selectedCategoryId) {
      validationErrors.category = "Please select a Category";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    const payload = {
      college_id: selectedCategoryId,
      type_name: divisionName.trim(),
    };

    SubCategoryService.saveCollegeType(payload)
      .then(() => {
        navigate("/nba/sub-category");
      })
      .catch((err) => {
        console.error("Failed to save sub category:", err);
        setErrors({ form: "Failed to save sub-category. Please try again." });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-slide-up bg-white rounded-2xl shadow-md relative">

      {/* Close Button */}
      <button
        onClick={() => navigate("/academics/subcategory")}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold"
      >
        ×
      </button>

      <h2 className="text-2xl font-semibold mb-6 text-blue-700">Add Sub Category</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading categories...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Category Dropdown */}
          <div>
            <label className="block font-medium mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>

            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${
                errors.category ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-blue-500`}
            >
              <option value="">-- Select Category --</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>

            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Sub Category Name */}
          <div>
            <label className="block font-medium mb-1">
              Sub Category Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${
                errors.divisionName ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-blue-500`}
              placeholder="e.g., Internal Assessment"
            />

            {errors.divisionName && (
              <p className="text-red-500 text-sm mt-1">{errors.divisionName}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {errors.form}
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate("/academics/subcategory")}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300"
            >
              {submitting ? "Saving..." : "Save Sub Category"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
