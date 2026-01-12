import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SubCategoryService } from "../Services/SubCategory.service";
import { CategoryService } from "../Services/Category.service";

export default function EditSubCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(true);

  /* ---------------- Load Categories ---------------- */
  useEffect(() => {
    CategoryService.getCategory().then((data) => {
      setCategories(data || []);
    });
  }, []);

  /* ---------------- Load SubCategory (no GET by ID) ---------------- */
  useEffect(() => {
    SubCategoryService.getAllCollegeTypes()
      .then((list) => {
        const item = list.find((x) => x.id == id);
        if (item) {
          setSubCategoryName(item.type_name);
          setSelectedCategoryId(item.college_id);
        } else {
          setError({ form: "Sub-category not found." });
        }
      })
      .catch(() => {
        setError({ form: "Failed to load sub-category." });
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!subCategoryName.trim()) {
      setError({ subCategoryName: "Required" });
      return;
    }
    if (!selectedCategoryId) {
      setError({ category: "Required" });
      return;
    }

    const payload = {
      college_id: selectedCategoryId,
      type_name: subCategoryName.trim()
    };

    SubCategoryService.updateCollegeType(id, payload)
      .then(() => navigate("/academics/subcategory"))
      .catch(() => setError({ form: "Failed to update." }));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-blue-700">Edit Sub Category</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* CATEGORY DROPDOWN */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Category</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.college_name}
              </option>
            ))}
          </select>
        </div>

        {/* SUB CATEGORY NAME */}
        <div>
          <label className="block font-medium mb-1">Sub Category Name</label>
          <input
            type="text"
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error.form && (
          <p className="text-red-500 text-sm">{error.form}</p>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/academics/subcategory")}
            className="bg-gray-300 px-6 py-2 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
