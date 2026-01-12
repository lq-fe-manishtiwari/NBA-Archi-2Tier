import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collegeService } from "../Services/college.service";

export default function EditProgram() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [programName, setProgramName] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [programLevel, setProgramLevel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    if (!isFetchedRef.current) {
      const fetchProgram = async () => {
        try {
          setLoading(true);
          const data = await collegeService.getProgrambyId(id);
          setProgramName(data.program_name);
          setProgramCode(data.program_code);
          setProgramLevel(data.program_level || "");
          setDescription(data.description || "");
        } catch (err) {
          setError("Failed to fetch program details.");
          console.error("Fetch program error:", err);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchProgram();
      }
  
      setTimeout(() => setShowForm(true), 50);
      isFetchedRef.current = true; // ✅ prevents second call
    }
  }, [id]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!programName.trim()) return setError("Program Name is required");
    if (!programCode.trim()) return setError("Program Code is required");

    setError("");
    setIsSubmitting(true);

    const payload = {
      program_id: Number(id),
      program_name: programName,
      program_code: programCode,
      program_level: programLevel,
      description: description,
    };

    try {
      await collegeService.updateProgrambyID(payload);
      navigate("/academics/program");
    } catch (err) {
      setError(err.message || "Failed to update program. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`mx-auto animate-slide-up relative transition-all duration-500 ease-out transform ${
        showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      {/* Close Button */}
      <button
        onClick={() => navigate("/academics/program")}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
      >
        ×
      </button>

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
        Edit Program
      </h2>

      {/* Form */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (

        <form onSubmit={handleSubmit}>
        {/* Program Name */}
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

        {/* Program Level */}
        <label className="block font-medium mb-1 text-gray-700">
          Program Level
        </label>
        <input
          type="text"
          value={programLevel}
          onChange={(e) => setProgramLevel(e.target.value)}
          placeholder="e.g., UG, PG"
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
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
