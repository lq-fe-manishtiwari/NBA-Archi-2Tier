import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DepartmentService } from "../Services/Department.service";
import { collegeService } from "../Services/college.service";

export default function AddDepartment() {
  const navigate = useNavigate();
  const [departmentName, setDepartmentName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    collegeService.getAllColleges().then(response => {
      setColleges(response || []);
    }).catch(err => {
      console.error("Failed to fetch colleges", err);
      setErrors({ form: "Could not load colleges for selection." });
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!departmentName.trim()) {
      newErrors.departmentName = "Department Name is required";
    }
    if (!collegeId) {
      newErrors.collegeId = "College is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const departmentData = {
      department_name: departmentName,
      college_id: parseInt(collegeId),
    };
    console.log("departmentData",departmentData);

    DepartmentService.saveDepartment(departmentData)
      .then(() => {
        navigate("/academics/department");
      })
      .catch(err => {
        console.error("Failed to add department:", err);
        setErrors({ form: "Failed to add department. Please try again." });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-slide-up bg-white rounded-2xl shadow-md">
      <button onClick={() => navigate("/academics/department")} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">
        ×
      </button>
      <h2 className="text-2xl font-semibold mb-6 text-blue-700">Add New Department</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">College</label>
          <select
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className={`w-full border rounded px-3 py-2 ${errors.collegeId ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select a College</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.college_name}</option>)}
          </select>
          {errors.collegeId && <p className="text-red-500 text-sm mt-1">{errors.collegeId}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Department Name</label>
          <input
            type="text"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            className={`w-full border rounded px-3 py-2 ${errors.departmentName ? "border-red-500" : "border-gray-300"}`}
            placeholder="e.g., Computer Science"
          />
          {errors.departmentName && <p className="text-red-500 text-sm mt-1">{errors.departmentName}</p>}
        </div>

        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/academics/department")}
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