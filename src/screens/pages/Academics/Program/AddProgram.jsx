import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collegeService } from "../Services/college.service";

export default function AddProgram() {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [programName, setProgramName] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [programLevel, setProgramLevel] = useState("");
  const [programStartYear, setProgramStartYear] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowForm(true), 50);
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const data = await collegeService.getAllColleges();
      setColleges(data);
    } catch (err) {
      setError("Failed to fetch colleges");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCollege) return setError("College is required");
    if (!programName.trim()) return setError("Program Name is required");
    if (!programCode.trim()) return setError("Program Code is required");
    if (!programLevel.trim()) return setError("Program Level is required");

    const payloads = [{
      program_name: programName,
      program_code: programCode,
      program_level: programLevel,
      college_id: Number(selectedCollege),
    }];

    setError("");
    setIsSubmitting(true);
    try {
      await collegeService.saveProgram(payloads);
      navigate("/academics/program");
    } catch (err) {
      setError(err.message || "Failed to add program. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`mx-auto animate-slide-up relative transition-all duration-500 ease-out transform ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
    >
      {/* Close Button */}
      <button
        onClick={() => navigate("/academics/program")}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
      >
        ×
      </button>

      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
        Add New Program
      </h2>

      {/* NBA / NIRF / NAAC Checkboxes */}
      <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center">

        {/* NBA */}
        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <input
            type="checkbox"
            className="w-4 h-4"
          />
          NBA
        </label>

        {/* NIRF */}
        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <input
            type="checkbox"
            className="w-4 h-4"
          />
          NIRF
        </label>

        {/* NAAC */}
        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <input
            type="checkbox"
            className="w-4 h-4"
          />
          NAAC
        </label>

      </div>


      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Program Name */}
        <label className="block font-medium mb-1 text-gray-700">
          College
        </label>
        <select
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
          disabled={loading}
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">{loading ? "Loading colleges..." : "Select a College"}</option>
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {college.college_name}
            </option>
          ))}
        </select>

        <label className="block font-medium mb-1 text-gray-700">
          Program Name
        </label>
        <input
          type="text"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          placeholder="Enter Program Name"
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Program Code */}
        <label className="block font-medium mb-1 text-gray-700">
          Program Code
        </label>
        <input
          type="text"
          value={programCode}
          onChange={(e) => setProgramCode(e.target.value)}
          placeholder="Enter Program Code"
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label className="block font-medium mb-1 text-gray-700">
          Program Start Year
        </label>
        <input
          type="text"
          value={programStartYear}
          onChange={(e) => setProgramStartYear(e.target.value)}
          placeholder="Enter Program Start Year"
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block font-medium mb-1 text-gray-700">
          Program Level
        </label>
        <input
          type="text"
          value={programLevel}
          onChange={(e) => setProgramLevel(e.target.value)}
          placeholder="Enter Program Level"
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        {/* Footer Buttons */}
        <div className="flex flex-col md:flex-row justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/academics/program")}
            className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded transition w-full md:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition w-full md:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
