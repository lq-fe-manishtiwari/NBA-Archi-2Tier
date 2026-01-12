import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { classService } from "../Services/class.service";     // your class service
import { collegeService } from "../Services/college.service"; // added
import SweetAlert from "react-bootstrap-sweetalert";

export default function AddClass() {
  const navigate = useNavigate();

  // New states for college selection
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [collegeLoading, setCollegeLoading] = useState(true);
  const [collegeError, setCollegeError] = useState("");

  const [animate, setAnimate] = useState(false);
  const [formData, setFormData] = useState({
    year_number: 1,
    name: "",
    semesters: [{ semester_number: 1, name: "" }],
  });

  const [error, setError] = useState("");           // for class name error
  const [semesterError, setSemesterError] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);    // for submit

  // Fetch colleges on mount
  useEffect(() => {
    setAnimate(true);
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setCollegeLoading(true);
      const data = await collegeService.getAllColleges();
      setColleges(data || []);
    } catch (err) {
      setCollegeError("Failed to load colleges");
      console.error(err);
    } finally {
      setCollegeLoading(false);
    }
  };

  // Handlers (unchanged except college validation)
  const handleClassChange = (e) => {
    if (error) setError("");
    setFormData({ ...formData, name: e.target.value });
  };

  const handleSemesterChange = (index, value) => {
    const updated = [...formData.semesters];
    updated[index].name = value;
    setFormData({ ...formData, semesters: updated });
    if (semesterError && value.trim()) setSemesterError("");
  };

  const addSemester = () => {
    setFormData({
      ...formData,
      semesters: [
        ...formData.semesters,
        { semester_number: formData.semesters.length + 1, name: "" },
      ],
    });
  };

  const removeSemester = (index) => {
    const updated = formData.semesters.filter((_, i) => i !== index);
    const renumbered = updated.map((s, i) => ({
      ...s,
      semester_number: i + 1,
    }));
    setFormData({ ...formData, semesters: renumbered });

    if (renumbered.length === 0) {
      setSemesterError("At least one semester is required");
    } else if (semesterError) {
      setSemesterError("");
    }
  };

  // Submit with college_id
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSemesterError("");
    setCollegeError("");

    // Validations
    if (!selectedCollege) {
      setCollegeError("Please select a college");
      return;
    }
    if (!formData.name.trim()) {
      setError("Class Name is required");
      return;
    }
    if (formData.semesters.length === 0) {
      setSemesterError("At least one semester is required");
      return;
    }
    const emptySem = formData.semesters.find((s) => !s.name?.trim());
    if (emptySem) {
      setSemesterError("All semesters must have a name");
      return;
    }

    setLoading(true);
    const payload = {
      college_id: Number(selectedCollege),           // added
      year_number: formData.year_number,
      name: formData.name,
      semesters: formData.semesters.map((s) => ({
        semester_number: s.semester_number,
        name: s.name,
      })),
    };

    try {
      const response = await classService.saveClass(payload);
      setAlert(
        <SweetAlert
          success
          title="Class Saved!"
          onConfirm={() => {
            setAlert(null);
            navigate("/academics/class");
          }}
          confirmBtnCssClass="btn-confirm"
        >
          {`${response.name} has been added successfully.`}
        </SweetAlert>
      );
    } catch (err) {
      console.error("Error saving class:", err);
      setAlert(
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          {err?.message || "Failed to save class. Please try again."}
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-slide-up">
      <div
        className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 transform transition-all duration-500 ease-out ${
          animate
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-10 scale-95"
        }`}
      >
        <button
          onClick={() => navigate("/academics/class")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-blue-700">
          Add New Class
        </h2>

        <form onSubmit={handleSubmit}>
          {/* College Dropdown - Same as AddProgram */}
          <div className="mb-5">
            <label className="block font-medium mb-1 text-gray-700">
              College <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
                if (collegeError) setCollegeError("");
              }}
              disabled={collegeLoading || loading}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                collegeError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">
                {collegeLoading ? "Loading colleges..." : "Select a College"}
              </option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.college_name}
                </option>
              ))}
            </select>
            {collegeError && (
              <p className="text-red-500 text-sm mt-1">{collegeError}</p>
            )}
          </div>

          {/* Class Name */}
          <div className="mb-5">
            <label className="block font-medium mb-1 text-gray-700">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleClassChange}
              className={`w-full border rounded px-3 py-2 ${
                error ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="e.g. First Year B.Tech"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {/* Year Number */}
          <div className="mb-5">
            <label className="block font-medium mb-1 text-gray-700">
              Class Year Number
            </label>
            <input
              type="number"
              min="1"
              value={formData.year_number}
              onChange={(e) =>
                setFormData({ ...formData, year_number: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Semesters */}
          <div className="mb-6">
            <label className="block font-medium mb-2 text-gray-700">
              Semesters
            </label>
            {formData.semesters.map((semester, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <input
                  type="number"
                  min="1"
                  value={semester.semester_number}
                  onChange={(e) => {
                    const updated = [...formData.semesters];
                    updated[index].semester_number = Number(e.target.value);
                    setFormData({ ...formData, semesters: updated });
                  }}
                  className="w-20 border border-gray-300 rounded px-3 py-2"
                  placeholder="No."
                />
                <input
                  type="text"
                  placeholder={`Semester ${index + 1} Name`}
                  value={semester.name}
                  onChange={(e) => handleSemesterChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {formData.semesters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSemester(index)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded"
                  >
                    −
                  </button>
                )}
                {index === formData.semesters.length - 1 && (
                  <button
                    type="button"
                    onClick={addSemester}
                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
            {semesterError && (
              <p className="text-red-500 text-sm mt-1">{semesterError}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/academics/class")}
              className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || collegeLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Class"}
            </button>
          </div>
        </form>
      </div>

      {alert}
    </div>
  );
}