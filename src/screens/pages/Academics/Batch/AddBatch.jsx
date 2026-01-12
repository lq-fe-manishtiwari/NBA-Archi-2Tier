import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { batchService } from "../Services/batch.Service";
import { collegeService } from "../Services/college.service";
import SweetAlert from "react-bootstrap-sweetalert";

export default function AddBatch() {
  const navigate = useNavigate();

  // Form state
  const [batchCode, setBatchCode] = useState("");
  const [batchName, setBatchName] = useState("");
  const [programId, setProgramId] = useState("");
  const [programs, setPrograms] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [useCustomYears, setUseCustomYears] = useState(false);
  const [academicYears, setAcademicYears] = useState([
    { year_number: 1, name: "", start_date: null, end_date: null },
  ]);

  const [error, setError] = useState("");
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await collegeService.getAllprogram();
        if (Array.isArray(data)) {
          setPrograms(data);
        }
      } catch (error) {
        console.error("Failed to fetch programs:", error);
      }
    };
    fetchPrograms();
  }, []);

  // Custom academic years ke liye handlers
  const handleAddYear = () => {
    setAcademicYears([
      ...academicYears,
      { year_number: academicYears.length + 1, name: "", start_date: null, end_date: null },
    ]);
  };

  const handleRemoveYear = (index) => {
    const newYears = academicYears.filter((_, i) => i !== index);
    // year_number ko re-index karein
    setAcademicYears(newYears.map((year, i) => ({ ...year, year_number: i + 1 })));
  };

  const handleYearChange = (index, field, value) => {
    const newYears = [...academicYears];
    newYears[index][field] = value;
    setAcademicYears(newYears);
  };

  // Form validation aur submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!batchCode.trim()) return setError("Batch Code is required");
    if (!batchName.trim()) return setError("Batch Name is required");
    if (!programId) return setError("Program is required");
    if (!startYear) return setError("Start Year is required");
    if (!endYear) return setError("End Year is required");
    if (parseInt(startYear) >= parseInt(endYear)) return setError("End Year must be after Start Year");

    const payload = {
      batch_code: batchCode,
      batch_name: batchName,
      program_id: parseInt(programId),
      start_year: parseInt(startYear),
      end_year: parseInt(endYear),
      description: description,
      is_active: isActive,
    };

    if (useCustomYears) {
      // Custom years ke liye validation
      for (const year of academicYears) {
        if (!year.name.trim() || !year.start_date || !year.end_date) {
          return setError("All custom academic year fields are required.");
        }
        if (new Date(year.start_date) >= new Date(year.end_date)) {
          return setError(`In Year ${year.year_number}, End Date must be after Start Date.`);
        }
      }
      payload.academic_years = academicYears.map(year => ({
        ...year,
        start_date: year.start_date ? year.start_date.toISOString().split('T')[0] : null, // 'YYYY-MM-DD' format
        end_date: year.end_date ? year.end_date.toISOString().split('T')[0] : null,   // 'YYYY-MM-DD' format
      }));
    }

    try {
      await batchService.saveBatch(payload);
      console.log("Batch created successfully!",payload);
      setSuccessAlert({
        title: "Success",
        message: "Batch created successfully!",
        onConfirm: () => navigate("/academics/batch"),
      });
    } catch (apiError) {
      setErrorAlert({
        title: "Error",
        message: apiError.message || "Something went wrong.",
        onConfirm: () => setErrorAlert(null),
      });
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-2xl shadow-md animate-slide-up relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-700">Add New Batch</h2>
        <button
          onClick={() => navigate("/academics/batch")}
          className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batch Code */}
          <div>
            <label className="block font-medium mb-1">Batch Code</label>
            <input
              type="text"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., BATCH2025"
            />
          </div>

        {/* Batch Name */}
          <div>
            <label className="block font-medium mb-1">Batch Name</label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Engineering 2025-2029"
            />
          </div>

          {/* Program Dropdown */}
          <div>
            <label className="block font-medium mb-1">Program</label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name}
                </option>
              ))}
            </select>
          </div>
          {/* Start Year */}
          <div>
            <label className="block font-medium mb-1">Start Year</label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 2025"
            />
          </div>

          {/* End Year */}
          <div>
            <label className="block font-medium mb-1">End Year</label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 2029"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows="3"
            placeholder="B.Tech Engineering"
          ></textarea>
        </div>

        {/* Is Active & Custom Years Toggles */}
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2">
            <label className="font-medium">Status:</label>
            <button type="button" onClick={() => setIsActive(!isActive)} className="flex items-center">
              {isActive ? <ToggleRight className="text-green-500 h-8 w-8" /> : <ToggleLeft className="text-gray-400 h-8 w-8" />}
              <span className={`ml-2 font-semibold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {isActive ? "Active" : "Inactive"}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-medium">Custom Academic Years:</label>
            <button type="button" onClick={() => setUseCustomYears(!useCustomYears)} className="flex items-center">
              {useCustomYears ? <ToggleRight className="text-blue-500 h-8 w-8" /> : <ToggleLeft className="text-gray-400 h-8 w-8" />}
               <span className={`ml-2 font-semibold ${useCustomYears ? 'text-blue-600' : 'text-gray-600'}`}>
                {useCustomYears ? "Enabled" : "Disabled"}
              </span>
            </button>
          </div>
        </div>

        {/* Academic Years */}
        {useCustomYears && (
          <div className="space-y-4 border-t pt-6">
            <label className="block font-medium text-lg">Custom Academic Year Details</label>
            {academicYears.map((year, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                   <h4 className="font-semibold">Year {year.year_number}</h4>
                   {academicYears.length > 1 && (
                     <button
                       type="button"
                       onClick={() => handleRemoveYear(index)}
                       className="text-red-500 hover:text-red-700 font-bold"
                     >
                       Remove
                     </button>
                   )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={year.name}
                    placeholder={`e.g., MBA Year ${year.year_number}`}
                    onChange={(e) => handleYearChange(index, "name", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <DatePicker
                    selected={year.start_date}
                    onChange={(date) => handleYearChange(index, "start_date", date)}
                    className="w-full border rounded px-3 py-2"
                    placeholderText="Start Date"
                     showMonthDropdown
  showYearDropdown
                  />
                  <DatePicker
                    selected={year.end_date}
                    onChange={(date) => handleYearChange(index, "end_date", date)}
                    className="w-full border rounded px-3 py-2"
                    placeholderText="End Date"
                   showMonthDropdown
  showYearDropdown
                  />
                </div>
              </div>
            ))}
             <button
                type="button"
                onClick={handleAddYear}
                className="w-full mt-2 bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg transition"
              >
                + Add Another Year
              </button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate("/academics/batch")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Save
          </button>
        </div>
      </form>

      {successAlert && (
        <SweetAlert
          success
          title={successAlert.title}
          onConfirm={successAlert.onConfirm}
          onCancel={successAlert.onConfirm}
          confirmBtnCssClass="btn-confirm"
        >
          {successAlert.message}
        </SweetAlert>
      )}

      {errorAlert && (
        <SweetAlert
          danger
          title={errorAlert.title}
          onConfirm={errorAlert.onConfirm}
          onCancel={errorAlert.onConfirm}
          confirmBtnCssClass="btn-confirm"
        >
          {errorAlert.message}
        </SweetAlert>
      )}
    </div>
  );
}
