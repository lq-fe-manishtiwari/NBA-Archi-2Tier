import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DivisionService } from "../Services/Division.service";

export default function AddDivision() {
  const navigate = useNavigate();
  const [divisionName, setDivisionName] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!divisionName.trim()) {
      newErrors.divisionName = "Division Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const divisionData = {
      division_name: divisionName,
    };

    // The API is /bulk, so we send an array
    DivisionService.saveDivision([divisionData])
      .then(() => {
        navigate("/academics/division");
      })
      .catch(err => {
        console.error("Failed to add division:", err);
        setErrors({ form: "Failed to add division. Please try again." });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-slide-up bg-white rounded-2xl shadow-md">
      <button
        onClick={() => navigate("/academics/division")}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
      >
        ×
      </button>
      <h2 className="text-2xl font-semibold mb-6 text-blue-700">Add New Division</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Division Name</label>
          <input
            type="text"
            value={divisionName}
            onChange={(e) => setDivisionName(e.target.value)}
            className={`w-full border rounded px-3 py-2 ${
              errors.divisionName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Section A"
          />
          {errors.divisionName && <p className="text-red-500 text-sm mt-1">{errors.divisionName}</p>}
        </div>

        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/academics/division")}
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
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
